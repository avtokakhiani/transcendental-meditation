import assert from 'node:assert/strict';
import { test } from 'node:test';
import { nextRequestContext } from './next-request-context';

test('corporate receipt requires storage, not mail acceptance; failures never confirm', async t => {
  const saved = { ...process.env };
  const globalState = globalThis as typeof globalThis & { prisma?: unknown };
  const previous = globalState.prisma;
  t.after(() => {
    for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
    if (previous === undefined) delete globalState.prisma; else globalState.prisma = previous;
  });
  Object.assign(process.env, { NODE_ENV: 'test', DATABASE_URL: 'sqlserver://127.0.0.1:1;database=fake;user=fake;password=fake',
    AUTH_SECRET: 'synthetic-corporate-secret-at-least-32-characters', AZURE_STORAGE_ACCOUNT: 'synthetic' });
  delete process.env.RESEND_API_KEY;
  let rejectStorage = false, finish: (() => void) | undefined;
  const rows = new Map<string, string>();
  globalState.prisma = { corporateInquiry: { async upsert(input: { where: { deduplicationKey: string } }) {
    if (rejectStorage) throw new Error('synthetic database unavailable');
    await new Promise<void>(resolve => { finish = resolve; });
    const key = input.where.deduplicationKey;
    if (!rows.has(key)) rows.set(key, '11111111-1111-4111-8111-111111111111');
    return { id: rows.get(key) };
  } } };
  const network = t.mock.method(globalThis, 'fetch', () => { throw new Error('Network forbidden'); });
  const context = await nextRequestContext();
  const { POST } = await import('../src/app/api/corporate-inquiries/route');
  const { corporateContactMethods } = await import('../src/lib/corporate-inquiry');
  const input = { name: 'Synthetic Person', organization: 'Synthetic Org', email: 'unit@example.invalid', phone: '',
    contactMethod: corporateContactMethods[1], message: 'Synthetic message', website: '', startedAt: Date.now() - 5000 };
  const request = (body: unknown = input, origin = 'http://localhost') => new Request('http://localhost/api/corporate-inquiries', {
    method: 'POST', headers: { origin, 'content-type': 'application/json' }, body: JSON.stringify(body),
  });
  assert.equal((await POST(request(input, 'https://other.invalid'))).status, 403);
  assert.equal((await POST(request({ ...input, email: 'bad' }))).status, 400);
  assert.equal((await POST(request({ ...input, website: 'spam' }))).status, 400);
  assert.equal((await POST(request({ ...input, startedAt: Date.now() }))).status, 400);
  for (let i = 0; i < 2; i++) {
    let confirmed = false;
    const receipt = context.run(() => POST(request())).then(response => { confirmed = true; return response; });
    while (!finish) await new Promise(resolve => setImmediate(resolve));
    assert.equal(confirmed, false, 'No confirmation before storage resolves');
    assert.equal(context.pending.length, 0);
    finish(); finish = undefined;
    assert.deepEqual(await (await receipt).json(), { ok: true });
    await context.drain();
  }
  assert.equal(rows.size, 1);
  rejectStorage = true;
  const failed = await context.run(() => POST(request({ ...input, email: 'dbfail@example.invalid' })));
  assert.equal(failed.status, 503);
  assert.equal((await failed.json()).ok, undefined);
  assert.equal(context.pending.length, 0);
  assert.equal(network.mock.calls.length, 0);
});
