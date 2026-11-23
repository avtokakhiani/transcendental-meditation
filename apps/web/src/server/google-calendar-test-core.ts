import { createHash, randomBytes } from 'node:crypto';
import { OAuth2Client } from 'google-auth-library';
import { runCalendarWriteTest } from './google-calendar-write-test';
import type { WriteReport } from './google-calendar-write-test';

export const TEST_ORIGIN = 'http://localhost:31997';
export const TEST_PATH = '/admin/calendar-test';
export const CALLBACK_PATH = '/api/admin/calendar-test/callback';
export const REDIRECT_URI = `${TEST_ORIGIN}${CALLBACK_PATH}`;
export const CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events.owned.readonly';
export const SCOPES = ['openid', 'email', CALENDAR_SCOPE];
export const WRITE_CALENDAR_SCOPE = 'https://www.googleapis.com/auth/calendar.events.owned';
export const WRITE_SCOPES = ['openid', 'email', WRITE_CALENDAR_SCOPE];
export type TestMode = 'read' | 'write';
export const CALENDAR_TEST_IMPLEMENTATION = 'owned-write-etag-retry-v4';
export const FLOW_TTL = 10 * 60 * 1000;
const RESULT_TTL = 30 * 60 * 1000;

export const MESSAGES = {
  success: 'Authorization and the read-only primary Calendar request succeeded. No event data was retained and no events were changed. This does not establish permission to write events or create Meet links.',
  write_success: 'The temporary event and its Google Meet video link were verified, and cleanup confirmed the event is deleted. No participants were invited.',
  meet_failed: 'Google accepted the event but reported conference generation failure. This alone does not prove an administrator restriction. Check Meet availability, licensing, and organization policies. See the separate cleanup result.',
  meet_timeout: 'A valid Google Meet video link was not verified within the polling limit. Generation may be delayed or unavailable. See the separate cleanup result; no second event was created.',
  event_verification_failed: 'The event returned by Google did not match the generated test identity and expected contents. No unrelated event was selected for modification. See the cleanup result.',
  cleanup_failed: 'Event and Meet verification succeeded, but cleanup did not confirm deletion. Use the run reference and start time to inspect only this test event manually.',
  cleanup_refused: 'Cleanup refused to delete: the generated ID, private marker, expected event contents, or conditional version check did not match. Inspect only this test event manually.',
  cleanup_unverified: 'Deletion could not be confirmed. Inspect the primary calendar for the exact test event run reference before retrying.',
  admin_policy_enforced: 'Google explicitly reported a Workspace administrator policy restriction. Ask the organization administrator to review this exact OAuth client ID and requested scopes.',
  access_denied: 'Access was denied. This alone does not identify the cause: consent may have been cancelled, the account may be missing from Test users, or organization policy may apply. Inspect the Google error screen and use the setup guide.',
  org_internal: 'The OAuth app is Internal to a different Google Cloud organization. Use an External app in Testing or a project in the account’s actual Workspace organization.',
  redirect_uri_mismatch: 'OAuth configuration error: the authorized redirect URI must exactly match the localhost callback URI in the setup guide.',
  invalid_client: 'OAuth configuration error: check that the client ID and secret belong to the same local Web application client.',
  invalid_grant: 'The authorization code expired, was reused, or failed redirect/PKCE validation. Start a new test; this is not evidence of a Workspace policy block.',
  invalid_scope: 'OAuth configuration error: check the requested scopes and Google Auth Platform Data Access settings.',
  disallowed_useragent: 'Google rejected the embedded browser. Open localhost in a normal Chrome, Edge, Firefox, or Safari browser.',
  session_error: 'The one-time state, browser cookie, admin session, or ten-minute time limit did not validate. Start again in the same browser. A server restart also clears pending tests.',
  account_mismatch: 'The verified Google account does not match the configured @tmgeorgia.ge test account, or is not identified as a managed Workspace account. No Calendar request was made. An organization’s primary hosted domain may differ from its email domain.',
  identity_failed: 'Google identity validation failed. No Calendar request was made. Check the Web client ID and start a new test.',
  missing_scope: 'The issued token did not include the scope required for the selected test. Retry and grant the Calendar permission on the consent screen.',
  unexpected_scope: 'Google returned additional permissions beyond this test. Remove this separate test app’s access from your Google account and retry with a fresh local OAuth client.',
  api_disabled: 'The Calendar API is disabled or has never been used in this OAuth project. Enable Google Calendar API in the same project and wait for the change to propagate.',
  insufficient_scope: 'The Calendar API reported insufficient OAuth permission. Check the scope granted for the selected test. This is not itself an administrator policy restriction.',
  calendar_forbidden: 'Calendar returned HTTP 403 without an explicit policy reason. Possible causes include Calendar service restrictions or account permissions. Ask the administrator to check service status and API controls; a policy block is not proven.',
  calendar_bad_request: 'Calendar rejected the API request with HTTP 400. For the write test, check whether Google Meet conference creation is supported for this account/calendar. This is an API failure, not proof of an OAuth configuration error or administrator block.',
  calendar_conflict: 'Calendar reported a resource conflict. The insert was not retried and no existing event was selected for cleanup.',
  calendar_missing: 'The primary calendar was not found. Open Google Calendar with the same account and ask the administrator whether Calendar is enabled for this user.',
  token_rejected: 'Google rejected the access token. Start a fresh authorization; token rejection alone does not establish a Workspace restriction.',
  rate_limited: 'Google reported a quota or rate limit. Wait and check the test project quota, then retry.',
  provider_unavailable: 'Google reported a temporary server error. Retry later.',
  network_error: 'A server-side Google request failed or timed out. Check connectivity and retry. No provider response or credentials were logged.',
  other_error: 'Google returned an unclassified failure. Check the Google error screen and setup guide. No raw provider response is displayed or logged.',
} as const;
export type ResultCode = keyof typeof MESSAGES;
export type Stage = 'authorization' | 'token' | 'identity' | 'calendar' | 'calendar-create' | 'calendar-verify' | 'calendar-cleanup';
export interface TestResult {
  code: ResultCode;
  stage: Stage;
  authorizationSucceeded: boolean;
  checkedAt: string;
  httpStatus?: number;
  mode?: TestMode;
  write?: WriteReport;
  implementation?: string;
}
export interface TestConfig { clientId: string; clientSecret: string; email: string }
type Identity = { email?: string; email_verified?: boolean; hd?: string; nonce?: string };
type VerifyIdentity = (token: string, audience: string) => Promise<Identity>;
interface Flow { owner: string; verifier: string; nonce: string; expires: number; config: TestConfig; mode: TestMode }
export interface CalendarTestState {
  flows: Map<string, Flow>;
  results: Map<string, { expires: number; result: TestResult }>;
  running: Set<string>;
}
export function createCalendarTestState(): CalendarTestState {
  return { flows: new Map(), results: new Map(), running: new Set() };
}

function object(value: unknown): Record<string, unknown> {
  return value !== null && typeof value === 'object' ? value as Record<string, unknown> : {};
}
export function oauthFailure(error: string | null): ResultCode {
  const known = ['admin_policy_enforced', 'access_denied', 'org_internal', 'redirect_uri_mismatch', 'invalid_client', 'invalid_grant', 'invalid_scope', 'disallowed_useragent'] as const;
  return known.find(code => code === error) ?? 'other_error';
}
export function apiFailure(status: number, body: unknown): ResultCode {
  const error = object(object(body).error);
  const reasons = [...(Array.isArray(error.errors) ? error.errors : []), ...(Array.isArray(error.details) ? error.details : [])].map(value => object(value).reason);
  if (reasons.includes('admin_policy_enforced') || reasons.includes('domainPolicy')) return 'admin_policy_enforced';
  if (reasons.includes('SERVICE_DISABLED') || reasons.includes('accessNotConfigured')) return 'api_disabled';
  if (reasons.includes('ACCESS_TOKEN_SCOPE_INSUFFICIENT') || reasons.includes('insufficientPermissions')) return 'insufficient_scope';
  if (status === 429 || reasons.some(reason => ['rateLimitExceeded', 'userRateLimitExceeded', 'quotaExceeded'].includes(String(reason)))) return 'rate_limited';
  if (status === 401) return 'token_rejected';
  if (status === 400) return 'calendar_bad_request';
  if (status === 409) return 'calendar_conflict';
  if (status === 404) return 'calendar_missing';
  if (status === 403) return 'calendar_forbidden';
  if (status >= 500) return 'provider_unavailable';
  return 'other_error';
}

const verifyIdentity: VerifyIdentity = async (token, audience) => {
  const client = new OAuth2Client();
  // Verifies Google's signature, issuer, audience, and expiry. Never decode an unverified JWT.
  const ticket = await client.verifyIdToken({ idToken: token, audience });
  return ticket.getPayload() as Identity;
};

/** Ephemeral local test only. Tokens remain local variables and never enter these maps. */
export class CalendarConnectivityTest {
  readonly implementationRevision = CALENDAR_TEST_IMPLEMENTATION;
  private flows: CalendarTestState['flows'];
  private results: CalendarTestState['results'];
  private running: CalendarTestState['running'];

  constructor(private request: typeof fetch = fetch, private verify: VerifyIdentity = verifyIdentity, private now = Date.now, state = createCalendarTestState()) {
    this.flows = state.flows;
    this.results = state.results;
    this.running = state.running;
  }

  /** Migrate only data from the pre-fix instance, preserving active flow/session locks. */
  static stateOf(instance: CalendarConnectivityTest): CalendarTestState {
    return { flows: instance.flows, results: instance.results, running: instance.running };
  }

  private prune() {
    for (const [key, value] of this.flows) if (value.expires <= this.now()) this.flows.delete(key);
    for (const [key, value] of this.results) if (value.expires <= this.now()) this.results.delete(key);
  }

  clear(owner: string) {
    if (this.running.has(owner)) return false;
    this.results.delete(owner);
    for (const [key, value] of this.flows) if (value.owner === owner) this.flows.delete(key);
    return true;
  }

  isRunning(owner: string) { return this.running.has(owner); }

  result(owner: string): TestResult | undefined {
    this.prune();
    return this.results.get(owner)?.result;
  }

  begin(owner: string, config: TestConfig, mode: TestMode = 'read') {
    if (this.running.has(owner)) throw new Error('A test is already running');
    this.prune();
    this.clear(owner);
    if (this.flows.size >= 100) throw new Error('Too many pending tests');
    const state = randomBytes(32).toString('base64url');
    const verifier = randomBytes(32).toString('base64url');
    const nonce = randomBytes(32).toString('base64url');
    this.flows.set(state, { owner, verifier, nonce, expires: this.now() + FLOW_TTL, config, mode });
    const url = new URL('https://accounts.google.com/o/oauth2/v2/auth');
    url.search = new URLSearchParams({
      client_id: config.clientId, redirect_uri: REDIRECT_URI, response_type: 'code',
      scope: (mode === 'write' ? WRITE_SCOPES : SCOPES).join(' '), state, nonce, code_challenge: createHash('sha256').update(verifier).digest('base64url'),
      code_challenge_method: 'S256', access_type: 'online', include_granted_scopes: 'false',
      prompt: 'select_account consent', login_hint: config.email,
      // No hd filter: tmgeorgia.ge may be a secondary domain in the parent organization.
    }).toString();
    return { state, url: url.toString() };
  }

  async complete(owner: string, cookie: string | undefined, params: URLSearchParams): Promise<TestResult> {
    this.prune();
    const state = params.get('state');
    const flow = state ? this.flows.get(state) : undefined;
    let stage: Stage = 'authorization';
    let authorizationSucceeded = false;
    let write: WriteReport | undefined;
    const finish = (code: ResultCode, httpStatus?: number) => {
      const result = { code, stage, authorizationSucceeded, implementation: this.implementationRevision, checkedAt: new Date(this.now()).toISOString(), ...(httpStatus === undefined ? {} : { httpStatus }), mode: flow?.mode ?? 'read', ...(write ? { write } : {}) };
      this.results.set(owner, { result, expires: this.now() + RESULT_TTL });
      return result;
    };
    if (!state || !cookie || cookie !== state || !flow || flow.owner !== owner) return finish('session_error');
    this.flows.delete(state); // Consume before any network call: code/state cannot be replayed.
    if (params.has('error')) return finish(oauthFailure(params.get('error')));
    const code = params.get('code');
    if (!code || code.length > 4096) return finish('other_error');
    if (this.running.has(owner)) return finish('session_error');
    this.running.add(owner);

    try {
      stage = 'token';
      const tokenResponse = await this.request('https://oauth2.googleapis.com/token', {
        method: 'POST', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({ code, client_id: flow.config.clientId, client_secret: flow.config.clientSecret,
          redirect_uri: REDIRECT_URI, grant_type: 'authorization_code', code_verifier: flow.verifier }),
      });
      const tokens = object(await tokenResponse.json());
      if (!tokenResponse.ok) return finish(tokenResponse.status >= 500 ? 'provider_unavailable' : oauthFailure(typeof tokens.error === 'string' ? tokens.error : null), tokenResponse.status);
      if (typeof tokens.access_token !== 'string' || tokens.token_type !== 'Bearer' || typeof tokens.id_token !== 'string') return finish('identity_failed');
      const granted = typeof tokens.scope === 'string' ? tokens.scope.split(/\s+/) : [];
      if (!granted.includes(flow.mode === 'write' ? WRITE_CALENDAR_SCOPE : CALENDAR_SCOPE)) return finish('missing_scope');
      const allowed = [...SCOPES, ...(flow.mode === 'write' ? WRITE_SCOPES : []), 'https://www.googleapis.com/auth/userinfo.email'];
      if (granted.some(scope => !allowed.includes(scope))) return finish('unexpected_scope');

      stage = 'identity';
      let identity: Identity;
      try { identity = await this.verify(tokens.id_token, flow.config.clientId); }
      catch { return finish('identity_failed'); }
      if (identity.nonce !== flow.nonce) return finish('identity_failed');
      if (!identity.email_verified || identity.email?.toLowerCase() !== flow.config.email || !identity.email.toLowerCase().endsWith('@tmgeorgia.ge') || !identity.hd) return finish('account_mismatch');
      authorizationSucceeded = true;

      if (flow.mode === 'write') {
        const outcome = await runCalendarWriteTest(this.request, tokens.access_token, apiFailure, this.now);
        write = outcome.report;
        stage = outcome.stage;
        return finish(outcome.code, outcome.httpStatus);
      }

      stage = 'calendar';
      const calendar = new URL('https://www.googleapis.com/calendar/v3/calendars/primary/events');
      calendar.search = new URLSearchParams({ maxResults: '1', timeMin: new Date(this.now()).toISOString(), timeMax: new Date(this.now() + 86400000).toISOString(), fields: 'kind' }).toString();
      const response = await this.request(calendar, {
        method: 'GET', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(15000),
        headers: { Authorization: `Bearer ${tokens.access_token}` },
      });
      const body = await response.json();
      if (!response.ok) return finish(apiFailure(response.status, body), response.status);
      return finish(object(body).kind === 'calendar#events' ? 'success' : 'other_error', response.status);
    } catch {
      // Do not log exceptions: fetch / OAuth library exceptions can contain credentials.
      return finish('network_error');
    } finally {
      this.running.delete(owner);
    }
  }
}
