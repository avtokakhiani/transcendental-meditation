import assert from 'node:assert/strict';
import { test } from 'node:test';
import { POST } from '../src/app/api/corporate-inquiries/route';

test('corporate endpoint validates, handles delivery failures, and sends all details', async () => {
  const originalFetch = globalThis.fetch;
  const saved = { key: process.env.RESEND_API_KEY, from: process.env.CORPORATE_FROM_EMAIL, to: process.env.ADMIN_EMAIL };
  const inquiry = { name: 'QA Person', organization: 'QA Organization', email: 'route-qa@example.invalid', phone: '+995 511 123456', program: 'ორივე პროგრამა', contactMethod: 'ტელეფონით', message: 'Corporate QA', website: '', startedAt: Date.now() - 5000 };
  const request = (body = inquiry, origin = 'http://localhost:31997') => new Request('http://localhost:31997/api/corporate-inquiries', { method: 'POST', headers: { Origin: origin, 'Content-Type': 'application/json' }, body: JSON.stringify(body) });
  try {
    assert.equal((await POST(request(inquiry, 'https://other.invalid'))).status, 403);
    assert.equal((await POST(request({ ...inquiry, email: 'invalid' }))).status, 400);
    assert.equal((await POST(request({ ...inquiry, phone: '' }))).status, 400);
    assert.equal((await POST(request({ ...inquiry, website: 'spam' }))).status, 400);
    assert.equal((await POST(request({ ...inquiry, startedAt: Date.now() }))).status, 400);
    delete process.env.RESEND_API_KEY;
    delete process.env.CORPORATE_FROM_EMAIL;
    delete process.env.ADMIN_EMAIL;
    assert.equal((await POST(request())).status, 503);

    // Dummy credentials are confined to this process; no network mail is sent.
    process.env.RESEND_API_KEY = 'test-only';
    process.env.CORPORATE_FROM_EMAIL = 'sender@example.invalid';
    process.env.ADMIN_EMAIL = 'admin@example.invalid';
    const keys: string[] = [];
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      const body = JSON.parse(String(options?.body));
      assert.equal(body.from, 'sender@example.invalid');
      assert.deepEqual(body.to, ['admin@example.invalid']);
      assert.equal(body.reply_to, inquiry.email);
      for (const field of ['name', 'organization', 'email', 'phone', 'program', 'contactMethod', 'message'] as const) assert.ok(body.text.includes(inquiry[field]));
      keys.push(new Headers(options?.headers).get('Idempotency-Key')!);
      return Response.json({ id: 'mock-email-id' });
    };
    assert.deepEqual(await (await POST(request())).json(), { ok: true });
    assert.deepEqual(await (await POST(request())).json(), { ok: true });
    assert.equal(keys[0], keys[1]);
    globalThis.fetch = async () => Response.json({ error: 'provider failure' }, { status: 500 });
    assert.equal((await POST(request())).status, 502);
    globalThis.fetch = async () => { throw new Error('network failure'); };
    assert.equal((await POST(request())).status, 502);
    assert.equal((await POST(request())).status, 429);
  } finally {
    globalThis.fetch = originalFetch;
    for (const [name, value] of [['RESEND_API_KEY', saved.key], ['CORPORATE_FROM_EMAIL', saved.from], ['ADMIN_EMAIL', saved.to]]) {
      if (value === undefined) delete process.env[name!];
      else process.env[name!] = value;
    }
  }
});
