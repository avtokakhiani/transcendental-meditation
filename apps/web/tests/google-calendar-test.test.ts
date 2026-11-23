import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { test } from 'node:test';
import { apiFailure, CalendarConnectivityTest, CALENDAR_SCOPE, CALENDAR_TEST_IMPLEMENTATION, createCalendarTestState, FLOW_TTL, oauthFailure, REDIRECT_URI, SCOPES, WRITE_SCOPES } from '../src/server/google-calendar-test-core';
import { probeCalendarRuntime } from '../src/server/google-calendar-runtime-probe';

const config = { clientId: 'local-test.apps.googleusercontent.com', clientSecret: 'synthetic-client-secret', email: 'test@tmgeorgia.ge' };
const owner = 'signed-admin-session-fingerprint';

function harness(options: { mode?: 'read' | 'write'; scope?: string; identity?: string; status?: number; body?: unknown; network?: boolean; tokenError?: string } = {}) {
  let now = Date.now();
  const calls: { url: URL; init?: RequestInit }[] = [];
  let nonce = '';
  const engine = new CalendarConnectivityTest(async (input, init) => {
    const url = new URL(String(input));
    calls.push({ url, init });
    if (options.network) throw new Error('synthetic-client-secret synthetic-access-token');
    if (url.pathname === '/token') {
      if (options.tokenError) return Response.json({ error: options.tokenError, error_description: 'sensitive raw text' }, { status: 400 });
      return Response.json({ access_token: 'synthetic-access-token', id_token: 'synthetic-id-token', token_type: 'Bearer', scope: options.scope ?? `${(options.mode === 'write' ? WRITE_SCOPES : SCOPES).join(' ')} https://www.googleapis.com/auth/userinfo.email` });
    }
    return Response.json(options.body ?? { kind: 'calendar#events' }, { status: options.status ?? 200 });
  }, async (token, audience) => {
    assert.equal(token, 'synthetic-id-token');
    assert.equal(audience, config.clientId);
    if (options.identity === 'invalid-signature') throw new Error('synthetic-id-token');
    return { nonce: options.identity === 'wrong-nonce' ? 'other' : nonce,
      email: options.identity === 'wrong-email' ? 'other@tmgeorgia.ge' : options.identity === 'outside-domain' ? 'test@example.com' : config.email,
      email_verified: options.identity !== 'unverified', hd: options.identity === 'unmanaged' ? undefined : 'parent-organization.example' };
  }, () => now);
  const start = engine.begin(owner, config, options.mode);
  nonce = new URL(start.url).searchParams.get('nonce')!;
  const params = new URLSearchParams({ state: start.state, code: 'synthetic-code' });
  return { engine, start, params, calls, advance: (ms: number) => { now += ms; }, complete: () => engine.complete(owner, start.state, params) };
}

test('uses exact local redirect, narrow scopes, online consent, random state, nonce, and S256 PKCE', () => {
  const h = harness();
  const params = new URL(h.start.url).searchParams;
  assert.equal(params.get('redirect_uri'), REDIRECT_URI);
  assert.equal(params.get('scope'), SCOPES.join(' '));
  assert.equal(params.get('access_type'), 'online');
  assert.equal(params.get('include_granted_scopes'), 'false');
  assert.equal(params.get('code_challenge_method'), 'S256');
  assert.equal(params.get('response_type'), 'code');
  assert.equal(params.get('hd'), null, 'A secondary email domain must not incorrectly filter a parent Workspace domain');
  assert.ok(h.start.state.length >= 43);
  assert.notEqual(h.start.state, h.engine.begin('other-session', config).state);
  assert.ok(!h.start.url.includes(config.clientSecret));
  assert.ok(!params.get('scope')!.includes('gmail'));
});

test('successful test only exchanges a code and performs a GET with no event content', async () => {
  const h = harness();
  const result = await h.complete();
  assert.equal(result.code, 'success');
  assert.equal(result.authorizationSucceeded, true);
  assert.equal(h.calls.length, 2);
  const [token, calendar] = h.calls;
  assert.equal(token!.url.toString(), 'https://oauth2.googleapis.com/token');
  assert.equal(token!.init!.method, 'POST');
  const body = token!.init!.body as URLSearchParams;
  assert.equal(body.get('client_secret'), config.clientSecret);
  assert.equal(body.get('redirect_uri'), REDIRECT_URI);
  assert.equal(createHash('sha256').update(body.get('code_verifier')!).digest('base64url'), new URL(h.start.url).searchParams.get('code_challenge'));
  assert.equal(calendar!.init!.method, 'GET');
  assert.equal(calendar!.url.pathname, '/calendar/v3/calendars/primary/events');
  assert.equal(calendar!.url.searchParams.get('maxResults'), '1');
  assert.equal(calendar!.url.searchParams.get('fields'), 'kind');
  assert.equal(new Headers(calendar!.init!.headers).get('Authorization'), 'Bearer synthetic-access-token');
  assert.ok(!calendar!.url.toString().includes('token'));
  for (const call of h.calls) { assert.equal(call.init!.cache, 'no-store'); assert.equal(call.init!.redirect, 'error'); }
  assert.doesNotMatch(JSON.stringify(result), /synthetic-|client_secret|id_token|access_token|refresh_token/);
  assert.deepEqual(h.engine.result(owner), result);
});

test('rejects missing/wrong state, cookie, and session before any Google request', async () => {
  for (const variant of ['no-state', 'wrong-state', 'no-cookie', 'wrong-cookie', 'wrong-session']) {
    const h = harness();
    if (variant === 'no-state') h.params.delete('state');
    if (variant === 'wrong-state') h.params.set('state', 'attacker');
    const result = await h.engine.complete(variant === 'wrong-session' ? 'other' : owner,
      variant === 'no-cookie' ? undefined : variant === 'wrong-cookie' ? 'attacker' : h.start.state, h.params);
    assert.equal(result.code, 'session_error');
    assert.equal(h.calls.length, 0);
  }
});

test('expires, consumes, supersedes, and clears one-time authorization flows', async () => {
  const expired = harness(); expired.advance(FLOW_TTL);
  assert.equal((await expired.complete()).code, 'session_error');
  assert.equal(expired.calls.length, 0);
  const replay = harness(); await replay.complete();
  assert.equal((await replay.complete()).code, 'session_error');
  assert.equal(replay.calls.length, 2);
  const superseded = harness(); superseded.engine.begin(owner, config);
  assert.equal((await superseded.complete()).code, 'session_error');
  const cleared = harness(); cleared.engine.clear(owner);
  assert.equal((await cleared.complete()).code, 'session_error');
  cleared.engine.clear(owner); assert.equal(cleared.engine.result(owner), undefined);
  const result = harness(); await result.complete(); result.advance(30 * 60 * 1000);
  assert.equal(result.engine.result(owner), undefined);
});

test('does not label generic consent denial as an administrator restriction or a missing test user', async () => {
  for (const code of ['access_denied', 'admin_policy_enforced', 'org_internal', 'redirect_uri_mismatch', 'invalid_scope']) {
    const h = harness(); h.params.set('error', code); h.params.set('error_description', '<script>secret</script>');
    const result = await h.complete();
    assert.equal(result.code, code);
    assert.equal(h.calls.length, 0);
    assert.ok(!JSON.stringify(result).includes('script'));
  }
  assert.equal(oauthFailure('untrusted-provider-message'), 'other_error');
});

test('rejects missing or unexpected grants without reading the calendar', async () => {
  for (const [scope, expected] of [['openid email', 'missing_scope'], [`${SCOPES.join(' ')} https://www.googleapis.com/auth/calendar.events`, 'unexpected_scope']]) {
    const h = harness({ scope });
    assert.equal((await h.complete()).code, expected);
    assert.equal(h.calls.length, 1);
  }
  assert.ok(CALENDAR_SCOPE.endsWith('calendar.events.owned.readonly'));
});

test('rejects invalid identity signatures, nonce, account, verification, or unmanaged identity before Calendar', async () => {
  for (const identity of ['invalid-signature', 'wrong-nonce', 'wrong-email', 'outside-domain', 'unverified', 'unmanaged']) {
    const h = harness({ identity });
    const result = await h.complete();
    assert.equal(result.code, ['invalid-signature', 'wrong-nonce'].includes(identity) ? 'identity_failed' : 'account_mismatch');
    assert.equal(result.authorizationSucceeded, false);
    assert.equal(h.calls.length, 1);
  }
});

test('distinguishes token configuration failures from Calendar API and Workspace errors', async () => {
  for (const tokenError of ['invalid_client', 'invalid_grant', 'admin_policy_enforced']) {
    const h = harness({ tokenError }); const result = await h.complete();
    assert.equal(result.code, tokenError); assert.equal(result.stage, 'token'); assert.equal(h.calls.length, 1);
  }
  const cases: [number, unknown, string][] = [
    [403, { error: { details: [{ reason: 'SERVICE_DISABLED' }] } }, 'api_disabled'],
    [403, { error: { errors: [{ reason: 'insufficientPermissions' }] } }, 'insufficient_scope'],
    [403, { error: { details: [{ reason: 'ACCESS_TOKEN_SCOPE_INSUFFICIENT' }] } }, 'insufficient_scope'],
    [403, { error: { errors: [{ reason: 'domainPolicy' }] } }, 'admin_policy_enforced'],
    [403, { error: { errors: [{ reason: 'rateLimitExceeded' }] } }, 'rate_limited'],
    [403, { error: { message: 'sensitive provider message', errors: [{ reason: 'forbidden' }] } }, 'calendar_forbidden'],
    [401, {}, 'token_rejected'], [404, {}, 'calendar_missing'], [429, {}, 'rate_limited'], [503, {}, 'provider_unavailable'],
  ];
  for (const [status, body, expected] of cases) {
    assert.equal(apiFailure(status, body), expected);
    const h = harness({ status, body }); const result = await h.complete();
    assert.equal(result.code, expected); assert.equal(result.stage, 'calendar');
    assert.equal(result.authorizationSucceeded, true); assert.equal(result.httpStatus, status);
    assert.ok(!JSON.stringify(result).includes('sensitive'));
  }
});

test('sanitizes thrown provider/network failures and rejects malformed success responses', async () => {
  const h = harness({ network: true });
  const result = await h.complete();
  assert.equal(result.code, 'network_error');
  assert.doesNotMatch(JSON.stringify(result), /synthetic-|client_secret|access_token|id_token|refresh_token/);
  const malformed = harness({ body: { secret: 'sensitive-event-data' } });
  assert.equal((await malformed.complete()).code, 'other_error');
});

test('write mode is server-bound, requests only the owned event write scope, and still validates identity and scopes', async () => {
  for (const identity of ['invalid-signature', 'wrong-nonce', 'wrong-email', 'unmanaged']) {
    const h = harness({ mode: 'write', identity });
    assert.equal(new URL(h.start.url).searchParams.get('scope'), WRITE_SCOPES.join(' '));
    const result = await h.complete();
    assert.equal(result.mode, 'write');
    assert.equal(result.authorizationSucceeded, false);
    assert.equal(h.calls.length, 1, 'No event API call before identity validation');
  }
  const readonly = harness({ mode: 'write', scope: SCOPES.join(' ') });
  assert.equal((await readonly.complete()).code, 'missing_scope');
  assert.equal(readonly.calls.length, 1);
  const broad = harness({ mode: 'write', scope: `${WRITE_SCOPES.join(' ')} https://www.googleapis.com/auth/calendar` });
  assert.equal((await broad.complete()).code, 'unexpected_scope');
  assert.equal(broad.calls.length, 1);
  const forged = harness(); forged.params.set('mode', 'write');
  assert.equal((await forged.complete()).mode, 'read');
  assert.equal(forged.calls[1]!.init!.method, 'GET', 'Callback parameters cannot upgrade a read flow');
});

test('write callback rejects wrong session/state and a rejected insert cannot be replayed', async () => {
  const invalid = harness({ mode: 'write', status: 403 });
  assert.equal((await invalid.engine.complete('other', invalid.start.state, invalid.params)).code, 'session_error');
  assert.equal(invalid.calls.length, 0);
  const h = harness({ mode: 'write', status: 403, body: { error: { errors: [{ reason: 'domainPolicy' }] } } });
  const result = await h.complete();
  assert.equal(result.code, 'admin_policy_enforced');
  assert.equal(result.stage, 'calendar-create');
  assert.equal(result.authorizationSucceeded, true);
  assert.equal(result.write!.creation.status, 'failed');
  assert.equal(result.write!.cleanup.status, 'not-attempted');
  assert.equal((await h.complete()).code, 'session_error');
  assert.equal(h.calls.filter(call => call.init?.method === 'POST' && call.url.pathname.endsWith('/events')).length, 1);
});

test('running flows cannot be replaced or cleared while a token exchange is active', async () => {
  let release!: () => void;
  const wait = new Promise<void>(resolve => { release = resolve; });
  const engine = new CalendarConnectivityTest(async () => { await wait; return Response.json({ error: 'invalid_grant' }, { status: 400 }); });
  const start = engine.begin(owner, config, 'write');
  const pending = engine.complete(owner, start.state, new URLSearchParams({ state: start.state, code: 'synthetic-code' }));
  assert.equal(engine.isRunning(owner), true);
  assert.throws(() => engine.begin(owner, config, 'write'));
  assert.equal(engine.clear(owner), false);
  release();
  await pending;
  assert.equal(engine.isRunning(owner), false);
  assert.equal(engine.clear(owner), true);
});

test('reloading code reuses transaction data without retaining old engine methods', async () => {
  let oldExecutions = 0;
  class OldEngine extends CalendarConnectivityTest {
    override async complete(...args: Parameters<CalendarConnectivityTest['complete']>) {
      oldExecutions++;
      return super.complete(...args);
    }
  }
  const old = new OldEngine();
  const flow = old.begin(owner, config, 'write');
  const fresh = new CalendarConnectivityTest(async () => Response.json({ error: 'invalid_grant' }, { status: 400 }), undefined, Date.now, CalendarConnectivityTest.stateOf(old));
  assert.notEqual(fresh.constructor, old.constructor);
  const params = new URLSearchParams({ state: flow.state, code: 'synthetic-only' });
  assert.equal((await fresh.complete('other-session', flow.state, params)).code, 'session_error');
  const result = await fresh.complete(owner, flow.state, params);
  assert.equal(result.code, 'invalid_grant', 'The existing flow remains valid after the engine is replaced');
  assert.equal(result.implementation, CALENDAR_TEST_IMPLEMENTATION);
  assert.equal(oldExecutions, 0, 'The old executable method was never called');
  assert.deepEqual(old.result(owner), result, 'Safe results remain in the same data store');
  assert.equal((await old.complete(owner, flow.state, params)).code, 'session_error', 'State is still one-time across engines');
});

test('HMR state sharing preserves cleanup locks while an old callback finishes', async () => {
  let release!: () => void;
  const blocked = new Promise<void>(resolve => { release = resolve; });
  const state = createCalendarTestState();
  const old = new CalendarConnectivityTest(async () => { await blocked; return Response.json({ error: 'invalid_grant' }, { status: 400 }); }, undefined, Date.now, state);
  const flow = old.begin(owner, config, 'write');
  const pending = old.complete(owner, flow.state, new URLSearchParams({ state: flow.state, code: 'synthetic-only' }));
  const fresh = new CalendarConnectivityTest(undefined, undefined, Date.now, state);
  assert.equal(fresh.isRunning(owner), true);
  assert.throws(() => fresh.begin(owner, config));
  assert.equal(fresh.clear(owner), false);
  release(); await pending;
  assert.equal(fresh.isRunning(owner), false);
  assert.equal(fresh.result(owner)?.code, 'invalid_grant');
});

test('offline runtime probe executes the complete current write path with no Google network', async () => {
  const result = await probeCalendarRuntime(CalendarConnectivityTest);
  assert.equal(result.offline, true);
  assert.equal(result.result, 'write_success');
  assert.equal(result.fractionalMilliseconds, 0);
  assert.equal(result.implementation, CALENDAR_TEST_IMPLEMENTATION);
  assert.ok(Object.values(result.firstRetrievalChecks!).every(Boolean));
  assert.equal(result.meet, 'succeeded'); assert.equal(result.cleanup, 'succeeded');
  assert.doesNotMatch(JSON.stringify(result), /synthetic-runtime|Bearer|"(?:access_token|id_token|client_secret|learnTMLocalTest)"/);
});
