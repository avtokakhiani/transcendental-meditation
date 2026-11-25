import assert from 'node:assert/strict';
import { test } from 'node:test';
import { privacyLaunchBlockers, productionPrivacyBlocked } from '../src/lib/privacy-retention';

test('production collection fails closed for each missing or unapproved privacy prerequisite', async t => {
  const saved = { ...process.env };
  const globalState = globalThis as typeof globalThis & { prisma?: unknown };
  const previousClient = globalState.prisma;
  t.after(() => {
    for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
    if (previousClient === undefined) delete globalState.prisma; else globalState.prisma = previousClient;
  });
  const flags = ['PRIVACY_LAUNCH_APPROVED', 'PRIVACY_BACKUPS_VERIFIED', 'PRIVACY_LOG_RETENTION_VERIFIED', 'PRIVACY_PROCESSORS_VERIFIED', 'PRIVACY_EXTERNAL_DELETION_VERIFIED', 'PRIVACY_RIGHTS_PROCESS_VERIFIED'];
  const settings = ['RESEND_API_KEY', 'CORPORATE_FROM_EMAIL', 'ADMIN_EMAIL', 'SITE_URL'];
  const approvedSynthetic = {
    ...Object.fromEntries(flags.map(key => [key, 'true'])),
    RESEND_API_KEY: 'synthetic-not-a-provider-key', MEETINGS_FROM_EMAIL: 'meetings@example.invalid',
    CORPORATE_FROM_EMAIL: 'corporate@example.invalid', ADMIN_EMAIL: 'operator@example.invalid', SITE_URL: 'https://example.invalid',
  };
  Object.assign(process.env, {
    NODE_ENV: 'test', DATABASE_URL: 'sqlserver://127.0.0.1:1;database=synthetic;user=synthetic;password=synthetic',
    AUTH_SECRET: 'synthetic-privacy-test-secret-at-least-32-characters', AZURE_STORAGE_ACCOUNT: 'synthetic',
  });
  let storageAccesses = 0, bodyReads = 0;
  globalState.prisma = new Proxy({}, { get() { storageAccesses++; throw new Error('Storage access forbidden in fail-closed tests'); } });
  const network = t.mock.method(globalThis, 'fetch', () => { throw new Error('Network access forbidden in privacy gate tests'); });
  const { POST } = await import('../src/app/api/corporate-inquiries/route');
  const reset = () => Object.assign(process.env, approvedSynthetic, { NODE_ENV: 'production' });
  const denied = async (expected: string) => {
    assert(privacyLaunchBlockers().includes(expected));
    assert.equal(productionPrivacyBlocked(), true);
    const request = new Request('https://example.invalid/api/corporate-inquiries', {
      method: 'POST', headers: { origin: 'https://example.invalid', 'content-type': 'application/json' }, body: '{"synthetic":true}',
    });
    Object.defineProperty(request, 'body', { get() { bodyReads++; throw new Error('Blocked collection must not read submitted data'); } });
    const response = await POST(request);
    assert.equal(response.status, 503);
    const data = await response.json();
    assert.equal(typeof data.error, 'string');
    assert.equal(data.ok, undefined);
    assert.equal(request.bodyUsed, false);
  };
  reset();
  delete process.env.MEETINGS_FROM_EMAIL;
  assert.deepEqual(privacyLaunchBlockers(), [], 'Disabled meetings must not require a meeting sender.');
  // This only verifies the logical gate with fake settings. It neither attests
  // actual practices nor calls the accepting API path or any external provider.
  assert.deepEqual(privacyLaunchBlockers(), []);
  assert.equal(productionPrivacyBlocked(), false);
  for (const key of [...flags, ...settings]) {
    reset(); delete process.env[key];
    await denied(key === 'SITE_URL' ? 'SITE_URL_HTTPS' : key);
  }
  for (const key of flags) for (const value of ['false', 'TRUE', '1', '']) {
    reset(); process.env[key] = value;
    await denied(key);
  }
  for (const value of ['http://example.invalid', 'not-a-url', '']) {
    reset(); process.env.SITE_URL = value;
    await denied('SITE_URL_HTTPS');
  }
  assert.equal(bodyReads, 0);
  assert.equal(storageAccesses, 0);
  assert.equal(network.mock.calls.length, 0);
});
