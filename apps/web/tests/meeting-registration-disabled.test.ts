import assert from 'node:assert/strict';
import { test } from 'node:test';
import { noUpcomingMeetingsNotice, publicMeetingRegistrationEnabled } from '../src/lib/meeting-registration-policy';

test('disabled meeting endpoints reject every payload without reading it or using SQL/mail', async t => {
  const saved = { ...process.env };
  t.after(() => {
    for (const key of Object.keys(process.env)) if (!(key in saved)) delete process.env[key];
    Object.assign(process.env, saved);
  });
  Object.assign(process.env, {
    NODE_ENV: 'test', DATABASE_URL: 'sqlserver://127.0.0.1:1;database=disabled;user=synthetic;password=synthetic',
    AUTH_SECRET: 'disabled-meeting-test-secret-at-least-32-characters', AZURE_STORAGE_ACCOUNT: 'synthetic',
  });
  // Use the supported development singleton slot to make accidental storage use
  // fail immediately, without relying on a live database or Prisma proxy mocks.
  const globalState = globalThis as typeof globalThis & { prisma?: unknown };
  const previousClient = globalState.prisma;
  const fakeClient = {
    $transaction() { throw new Error('SQL must not be called'); },
    introductoryMeeting: { findMany() { throw new Error('SQL must not be called'); } },
  };
  globalState.prisma = fakeClient;
  t.after(() => { if (previousClient === undefined) delete globalState.prisma; else globalState.prisma = previousClient; });
  const transaction = t.mock.method(fakeClient, '$transaction');
  const query = t.mock.method(fakeClient.introductoryMeeting, 'findMany');
  const mail = t.mock.method(globalThis, 'fetch', () => { throw new Error('Network must not be called'); });
  const { GET } = await import('../src/app/api/meetings/route');
  const { POST } = await import('../src/app/api/meetings/register/route');
  const payload = { meetingId: '11111111-1111-4111-8111-111111111111', firstName: 'Synthetic', lastName: 'Test', email: 'disabled@example.invalid', phone: '+995511111111' };
  assert.equal(publicMeetingRegistrationEnabled(), false);
  for (const mode of ['development', 'production']) {
    Object.assign(process.env, { NODE_ENV: mode, PRIVACY_LAUNCH_APPROVED: 'true', MEETING_REGISTRATION_ENABLED: 'true', NEXT_PUBLIC_MEETING_REGISTRATION_ENABLED: 'true' });
    const available = await GET();
    assert.equal(available.status, 200);
    assert.deepEqual(await available.json(), { meetings: [] });
    assert.equal(available.headers.get('cache-control'), 'no-store');
    for (const body of [JSON.stringify(payload), '{}', '{invalid', 'x'.repeat(10000)]) {
      const request = new Request('http://localhost/api/meetings/register', { method: 'POST', headers: { origin: 'http://localhost', 'content-type': 'application/json' }, body });
      Object.defineProperty(request, 'body', { get() { throw new Error('Disabled submission must not read body'); } });
      const response = await POST(request);
      assert.equal(response.status, 403);
      assert.equal(response.headers.get('cache-control'), 'no-store');
      assert.deepEqual(await response.json(), { error: noUpcomingMeetingsNotice, code: 'MEETING_REGISTRATION_DISABLED' });
      assert.equal(request.bodyUsed, false);
    }
    for (const headers of [new Headers(), new Headers({ origin: 'https://untrusted.invalid', 'content-type': 'application/x-www-form-urlencoded' })]) {
      const response = await POST(new Request('http://localhost/api/meetings/register', { method: 'POST', headers, body: 'synthetic' }));
      assert.equal(response.status, 403);
      assert.equal((await response.json()).code, 'MEETING_REGISTRATION_DISABLED');
    }
  }
  assert.equal(transaction.mock.calls.length, 0);
  assert.equal(query.mock.calls.length, 0);
  assert.equal(mail.mock.calls.length, 0);
});
