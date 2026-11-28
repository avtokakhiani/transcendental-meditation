import assert from 'node:assert/strict';
import { test } from 'node:test';
import { apiFailure } from '../src/server/google-calendar-test-core';
import { runCalendarWriteTest, TEST_EVENT_TITLE } from '../src/server/google-calendar-write-test';

type Event = Record<string, unknown>;
interface Options {
  pending?: number; meetFailure?: boolean; invalidMeet?: boolean; foreign?: boolean; altered?: boolean; missingEtag?: boolean; emptyEtag?: boolean; unexpectedGuests?: boolean;
  insertStatus?: number; insertLost?: boolean; insertNeverArrived?: boolean; deleteStatus?: number; deleteLost?: boolean; verifyFailure?: boolean; cleanupFailure?: boolean; confirmFailure?: boolean;
  clockMs?: number; normalizeSeconds?: boolean; timezoneOffset?: boolean; insertOkStatus?: number;
  startShiftMs?: number; endShiftMs?: number; missingMarker?: boolean; wrongId?: boolean; invalidDateTime?: boolean;
  wrongMeetRequest?: boolean; wrongMeetType?: boolean;
  versionBeforeCleanup?: boolean; versionRace?: boolean; retryReadFailure?: boolean;
  afterConflict?: 'marker' | 'id' | 'title' | 'start' | 'end' | 'attendees' | 'recurrence' | 'etag' | 'absent' | 'cancelled';
}
function harness(options: Options = {}) {
  const calls: { url: URL; init: RequestInit }[] = [];
  const pauses: number[] = [];
  let payload: Event;
  let stored: Event | null = null;
  let reads = 0;
  let clockReads = 0;
  const request: typeof fetch = async (input, init = {}) => {
    const url = new URL(String(input));
    calls.push({ url, init });
    assert.equal(url.origin, 'https://www.googleapis.com');
    assert.ok(url.pathname.startsWith('/calendar/v3/calendars/primary/events'));
    assert.equal(new Headers(init.headers).get('Authorization'), 'Bearer synthetic-access-token');
    assert.equal(init.cache, 'no-store'); assert.equal(init.redirect, 'error');
    if (init.method === 'POST') {
      assert.equal(calls.filter(call => call.init.method === 'POST').length, 1, 'No retry of insert');
      payload = JSON.parse(String(init.body)) as Event;
      if (options.insertNeverArrived) throw new Error('synthetic-network-error');
      const conference = payload.conferenceData as { createRequest: { requestId: string } };
      stored = { ...payload, status: 'confirmed', ...(options.missingEtag ? {} : { etag: '"test-version"' }),
        conferenceData: { createRequest: { requestId: conference.createRequest.requestId, status: { statusCode: options.meetFailure ? 'failure' : 'success' } },
          conferenceSolution: { key: { type: 'hangoutsMeet' } }, entryPoints: [{ entryPointType: 'video', uri: options.invalidMeet ? 'https://other.invalid/abc-defg-hij' : 'https://meet.google.com/abc-defg-hij' }] } };
      if (options.foreign) stored.extendedProperties = { private: { learnTMLocalTest: 'unrelated-event' } };
      if (options.altered) stored.summary = 'Existing content changed by someone else';
      if (options.emptyEtag) stored.etag = '';
      if (options.unexpectedGuests) stored.attendees = [{ email: 'unrelated@example.invalid' }];
      if (options.missingMarker) delete stored.extendedProperties;
      if (options.wrongId) stored.id = 'unrelatedevent';
      if (options.startShiftMs) stored.start = { dateTime: new Date(Date.parse((stored.start as { dateTime: string }).dateTime) + options.startShiftMs).toISOString() };
      if (options.endShiftMs) stored.end = { dateTime: new Date(Date.parse((stored.end as { dateTime: string }).dateTime) + options.endShiftMs).toISOString() };
      if (options.invalidDateTime) stored.start = { dateTime: 'invalid-date-time' };
      if (options.normalizeSeconds) {
        for (const field of ['start', 'end']) {
          const dateTime = (stored[field] as { dateTime: string }).dateTime;
          stored[field] = { dateTime: new Date(Math.floor(Date.parse(dateTime) / 1000) * 1000).toISOString().replace('.000Z', '+00:00'), timeZone: 'UTC' };
        }
      }
      if (options.timezoneOffset) {
        for (const field of ['start', 'end']) {
          const dateTime = (stored[field] as { dateTime: string }).dateTime;
          stored[field] = { dateTime: new Date(Date.parse(dateTime) + 4 * 3600000).toISOString().replace('.000Z', '+04:00'), timeZone: 'Asia/Tbilisi' };
        }
      }
      const generatedConference = stored.conferenceData as { createRequest: { requestId: string }; conferenceSolution: { key: { type: string } } };
      if (options.wrongMeetRequest) generatedConference.createRequest.requestId = 'unrelated-conference-request';
      if (options.wrongMeetType) generatedConference.conferenceSolution.key.type = 'unrecognized-type';
      if (options.insertLost) throw new Error('synthetic-access-token raw provider exception');
      if (options.insertStatus) return Response.json({ error: { errors: [{ reason: options.insertStatus === 403 ? 'domainPolicy' : 'other' }] } }, { status: options.insertStatus });
      return Response.json(stored, { status: options.insertOkStatus ?? 201 });
    }
    assert.equal(url.pathname, `/calendar/v3/calendars/primary/events/${payload!.id}`, 'Only the fresh generated ID can be read/deleted');
    if (init.method === 'DELETE') {
      assert.equal(url.searchParams.get('sendUpdates'), 'none');
      assert.equal(new Headers(init.headers).get('If-Match'), stored?.etag, 'Every DELETE uses the latest fetched version');
      const attempts = calls.filter(call => call.init.method === 'DELETE').length;
      assert.ok(attempts <= 3, 'Conditional deletion is bounded');
      if (options.versionRace && attempts === 1) {
        stored!.etag = '"updated-version"';
        switch (options.afterConflict) {
          case 'marker': stored!.extendedProperties = { private: { learnTMLocalTest: 'foreign' } }; break;
          case 'id': stored!.id = 'foreign'; break;
          case 'title': stored!.summary = 'Changed'; break;
          case 'start': stored!.start = { dateTime: '2026-11-24T12:00:00.001Z' }; break;
          case 'end': stored!.end = { dateTime: '2026-11-24T12:10:00.001Z' }; break;
          case 'attendees': stored!.attendees = [{ email: 'foreign@example.invalid' }]; break;
          case 'recurrence': stored!.recurrence = ['RRULE:FREQ=DAILY']; break;
          case 'etag': delete stored!.etag; break;
          case 'absent': stored = null; break;
          case 'cancelled': stored!.status = 'cancelled'; break;
        }
        return Response.json({ error: {} }, { status: 412 });
      }
      if (options.deleteStatus) return Response.json({ error: {} }, { status: options.deleteStatus });
      stored = null;
      if (options.deleteLost) throw new Error('synthetic-access-token');
      return new Response(null, { status: 204 });
    }
    assert.equal(init.method, 'GET', 'No PATCH, PUT, calendar listing, or other operations');
    reads++;
    if (options.retryReadFailure && reads === 3) return Response.json({ error: {} }, { status: 503 });
    if (options.versionBeforeCleanup && reads === 2 && stored) stored.etag = '"pre-cleanup-version"';
    if ((options.verifyFailure && reads === 1) || (options.cleanupFailure && reads === 2) || (options.confirmFailure && stored === null)) return Response.json({ error: { errors: [{ reason: 'forbidden' }] } }, { status: 403 });
    if (!stored) return Response.json({ error: { message: 'Not found' } }, { status: 404 });
    if (reads <= (options.pending ?? 0)) {
      const copy = structuredClone(stored);
      (copy.conferenceData as { createRequest: { status: { statusCode: string } } }).createRequest.status.statusCode = 'pending';
      return Response.json(copy);
    }
    return Response.json(stored);
  };
  return { calls, pauses, get clockReads() { return clockReads; }, get payload() { return payload!; }, run: () => runCalendarWriteTest(request, 'synthetic-access-token', apiFailure, () => { clockReads++; return options.clockMs ?? Date.parse('2026-11-23T12:00:00Z'); }, async ms => { pauses.push(ms); }) };
}

test('creates exactly one private no-attendee event, verifies a Meet link, and deletes only its marked ID', async () => {
  const h = harness(); const result = await h.run();
  assert.equal(result.code, 'write_success');
  for (const step of [result.report.creation, result.report.verification, result.report.meet, result.report.cleanup]) assert.equal(step.status, 'succeeded');
  assert.match(h.payload.id as string, /^learntm[0-9a-f]{32}$/);
  assert.equal(h.payload.summary, TEST_EVENT_TITLE);
  assert.deepEqual(h.payload.start, { dateTime: '2026-11-24T12:00:00.000Z' });
  assert.deepEqual(h.payload.end, { dateTime: '2026-11-24T12:10:00.000Z' });
  assert.equal(h.payload.visibility, 'private'); assert.equal(h.payload.transparency, 'transparent');
  assert.deepEqual(h.payload.reminders, { useDefault: false, overrides: [] });
  assert.ok(!('attendees' in h.payload)); assert.ok(!('recurrence' in h.payload));
  assert.equal(h.calls[0]!.url.searchParams.get('conferenceDataVersion'), '1');
  assert.equal(h.calls[0]!.url.searchParams.get('sendUpdates'), 'none');
  assert.deepEqual(h.calls.map(call => call.init.method), ['POST', 'GET', 'GET', 'DELETE', 'GET']);
  assert.doesNotMatch(JSON.stringify(result), /synthetic-access-token|conferenceData|learnTMLocalTest|meet\.google\.com|Bearer/);
  const another = harness(); await another.run(); assert.notEqual(another.payload.id, h.payload.id);
});

test('polls pending conference generation without creating another event', async () => {
  const h = harness({ pending: 2 }); const result = await h.run();
  assert.equal(result.code, 'write_success'); assert.equal(h.pauses.length, 2);
  assert.equal(h.calls.filter(call => call.init.method === 'POST').length, 1);
});

test('cleans up after Meet failure, timeout, or an untrusted video URL', async () => {
  for (const [options, code] of [[{ meetFailure: true }, 'meet_failed'], [{ pending: 100 }, 'meet_timeout'], [{ invalidMeet: true }, 'meet_timeout']] as const) {
    const h = harness(options); const result = await h.run();
    assert.equal(result.code, code); assert.equal(result.report.meet.status, 'failed');
    assert.equal(result.report.cleanup.status, 'succeeded');
    assert.equal(h.calls.filter(call => call.init.method === 'DELETE').length, 1);
  }
});

test('refuses to delete an ID whose marker/content changed or whose version cannot be checked', async () => {
  for (const options of [{ foreign: true }, { altered: true }, { missingEtag: true }, { emptyEtag: true }, { unexpectedGuests: true }]) {
    const h = harness(options); const result = await h.run();
    assert.equal(result.report.cleanup.status, 'refused');
    assert.equal(result.report.cleanup.code, 'cleanup_refused');
    assert.equal(h.calls.filter(call => call.init.method === 'DELETE').length, 0);
  }
});

test('a rejected or colliding insert never triggers a read or deletion of an existing event', async () => {
  for (const insertStatus of [400, 401, 403, 404, 409, 429]) {
    const h = harness({ insertStatus }); const result = await h.run();
    assert.equal(h.calls.length, 1); assert.equal(result.report.cleanup.status, 'not-attempted');
    assert.equal(result.report.creation.status, 'failed');
    if (insertStatus === 403) assert.equal(result.code, 'admin_policy_enforced');
  }
});

test('lost insert responses and ambiguous 5xx recover only the generated marked ID for cleanup', async () => {
  for (const options of [{ insertLost: true }, { insertStatus: 503 }]) {
    const h = harness(options); const result = await h.run();
    assert.equal(result.report.creation.status, 'succeeded');
    assert.equal(result.report.cleanup.status, 'succeeded');
    assert.equal(h.calls.filter(call => call.init.method === 'POST').length, 1);
    assert.equal(h.calls.filter(call => call.init.method === 'DELETE').length, 1);
    assert.doesNotMatch(JSON.stringify(result), /synthetic-|raw provider|Bearer/);
  }
});

test('a failed verification read still attempts cleanup; a failed cleanup read cannot permit deletion', async () => {
  const recovery = harness({ verifyFailure: true }); const result = await recovery.run();
  assert.equal(result.code, 'calendar_forbidden'); assert.equal(result.report.cleanup.status, 'succeeded');
  const failed = harness({ cleanupFailure: true }); const failure = await failed.run();
  assert.equal(failure.code, 'cleanup_failed'); assert.equal(failure.report.cleanup.code, 'calendar_forbidden');
  assert.equal(failed.calls.filter(call => call.init.method === 'DELETE').length, 0);
});

test('version conflicts are bounded; other cleanup API errors never retry deletion', async () => {
  for (const deleteStatus of [403, 412, 503]) {
    const h = harness({ deleteStatus }); const result = await h.run();
    assert.equal(result.code, 'cleanup_failed');
    assert.equal(result.report.cleanup.status, deleteStatus === 412 ? 'refused' : 'failed');
    assert.equal(result.report.cleanup.httpStatus, deleteStatus);
    assert.equal(h.calls.filter(call => call.init.method === 'DELETE').length, deleteStatus === 412 ? 3 : 1);
    assert.equal(result.report.cleanup.versionConflicts, deleteStatus === 412 ? 3 : 0);
  }
});

test('uses a changed cleanup version and safely recovers from a subsequent HTTP 412', async () => {
  const fresh = harness({ versionBeforeCleanup: true }); const initial = await fresh.run();
  assert.equal(initial.code, 'write_success');
  assert.equal(initial.report.cleanup.versionChangedSinceVerification, true);
  assert.equal(initial.report.cleanup.deleteAttempts, 1);
  const race = harness({ versionRace: true }); const result = await race.run();
  assert.equal(result.code, 'write_success');
  assert.equal(result.report.cleanup.deleteAttempts, 2);
  assert.equal(result.report.cleanup.versionConflicts, 1);
  assert.equal(result.report.cleanup.versionChangedAfterConflict, true);
  assert.deepEqual(race.calls.map(call => call.init.method), ['POST', 'GET', 'GET', 'DELETE', 'GET', 'DELETE', 'GET']);
  assert.deepEqual(race.calls.filter(call => call.init.method === 'DELETE').map(call => new Headers(call.init.headers).get('If-Match')), ['"test-version"', '"updated-version"']);
  assert.doesNotMatch(JSON.stringify(result), /test-version|updated-version|synthetic-access-token|Bearer/);
});

test('a 412 retry refuses every changed identity/content field or missing version', async () => {
  const cases = [['marker', 'private_marker'], ['id', 'event_id'], ['title', 'title'], ['start', 'start_time'], ['end', 'end_time'], ['attendees', 'attendees'], ['recurrence', 'recurrence'], ['etag', 'event_version']] as const;
  for (const [afterConflict, failedCheck] of cases) {
    const h = harness({ versionRace: true, afterConflict }); const result = await h.run();
    assert.equal(result.report.cleanup.status, 'refused');
    assert.deepEqual(result.report.cleanup.failedChecks, [failedCheck]);
    assert.equal(result.report.cleanup.deleteAttempts, 1, 'No second deletion if full validation fails');
  }
});

test('a 412 followed by absence/cancellation confirms cleanup; a failed re-fetch prevents another delete', async () => {
  for (const afterConflict of ['absent', 'cancelled'] as const) {
    const result = await harness({ versionRace: true, afterConflict }).run();
    assert.equal(result.code, 'write_success'); assert.equal(result.report.cleanup.deleteAttempts, 1);
  }
  const failed = await harness({ versionRace: true, retryReadFailure: true }).run();
  assert.equal(failed.report.cleanup.status, 'failed'); assert.equal(failed.report.cleanup.httpStatus, 503);
  assert.equal(failed.report.cleanup.deleteAttempts, 1);
});

test('confirms deletion after a lost DELETE response; failed absence verification is not called success', async () => {
  const lost = harness({ deleteLost: true }); assert.equal((await lost.run()).code, 'write_success');
  const failed = harness({ confirmFailure: true }); const result = await failed.run();
  assert.equal(result.code, 'cleanup_failed'); assert.equal(result.report.cleanup.status, 'failed');
});

test('a request that never reached Google is not reported as event creation or full success', async () => {
  const h = harness({ insertNeverArrived: true }); const result = await h.run();
  assert.equal(result.code, 'network_error');
  assert.equal(result.report.creation.status, 'unknown');
  assert.equal(result.report.cleanup.status, 'succeeded');
  assert.equal(result.report.cleanup.httpStatus, 404);
  assert.equal(h.calls.filter(call => call.init.method === 'DELETE').length, 0);
});

test('fractional real-world clock and second-normalized API responses still verify and clean up', async () => {
  const h = harness({ clockMs: Date.parse('2026-11-23T12:00:00.789Z'), normalizeSeconds: true, insertOkStatus: 200 });
  const result = await h.run();
  assert.equal(result.report.creation.status, 'succeeded');
  assert.equal(result.report.creation.httpStatus, 200);
  assert.equal(result.report.verification.status, 'succeeded');
  assert.equal(result.code, 'write_success');
  assert.equal(result.report.meet.status, 'succeeded');
  assert.equal(result.report.cleanup.status, 'succeeded');
  assert.equal(h.calls.filter(call => call.init.method === 'POST').length, 1);
  assert.equal(h.calls.filter(call => call.init.method === 'DELETE').length, 1);
  assert.equal(h.clockReads, 1, 'Start and end derive from the same sampled clock');
  assert.equal(Date.parse((h.payload.start as { dateTime: string }).dateTime) % 1000, 0);
  assert.equal(Date.parse((h.payload.end as { dateTime: string }).dateTime) - Date.parse((h.payload.start as { dateTime: string }).dateTime), 600000);
});

test('equivalent RFC3339 offsets are accepted while any actual time change is refused without tolerance', async () => {
  const offset = harness({ timezoneOffset: true });
  assert.equal((await offset.run()).code, 'write_success');
  for (const [options, expected] of [[{ startShiftMs: 1 }, 'start_time'], [{ endShiftMs: 1 }, 'end_time'], [{ startShiftMs: 1000 }, 'start_time'], [{ endShiftMs: -1000 }, 'end_time'], [{ invalidDateTime: true }, 'start_time']] as const) {
    const h = harness(options); const result = await h.run();
    assert.equal(result.code, 'event_verification_failed');
    assert.deepEqual(result.report.verification.failedChecks, [expected]);
    assert.deepEqual(result.report.cleanup.failedChecks, [expected]);
    assert.equal(result.report.cleanup.status, 'refused');
    assert.equal(result.report.meet.status, 'not-attempted', 'A failed event check must not masquerade as a Meet-generation failure');
    assert.equal(h.calls.filter(call => call.init.method === 'DELETE').length, 0);
  }
});

test('diagnostics identify the failing identity/content field without retaining actual marker or event contents', async () => {
  const cases = [[{ wrongId: true }, 'event_id'], [{ missingMarker: true }, 'private_marker'], [{ foreign: true }, 'private_marker'], [{ altered: true }, 'title'], [{ unexpectedGuests: true }, 'attendees']] as const;
  for (const [options, expected] of cases) {
    const h = harness(options); const result = await h.run();
    assert.deepEqual(result.report.verification.failedChecks, [expected]);
    assert.deepEqual(result.report.cleanup.failedChecks, [expected]);
    assert.equal(result.report.meet.status, 'not-attempted');
    assert.equal(h.calls.filter(call => call.init.method === 'DELETE').length, 0);
    const safe = JSON.stringify(result);
    const marker = (h.payload.extendedProperties as { private: { learnTMLocalTest: string } }).private.learnTMLocalTest;
    assert.ok(!safe.includes(marker));
    assert.doesNotMatch(safe, /unrelatedevent|unrelated@example.invalid|Existing content changed|synthetic-access-token|Bearer|meet\.google\.com/);
  }
});

test('Meet request/type/status/video checks remain strict and separate from event verification and cleanup', async () => {
  for (const [options, expected] of [[{ wrongMeetRequest: true }, 'meet_request'], [{ wrongMeetType: true }, 'meet_type'], [{ invalidMeet: true }, 'meet_video'], [{ meetFailure: true }, 'meet_status']] as const) {
    const h = harness(options); const result = await h.run();
    assert.equal(result.report.verification.status, 'succeeded');
    assert.deepEqual(result.report.meet.failedChecks, [expected]);
    assert.equal(result.report.meet.status, 'failed');
    assert.equal(result.report.cleanup.status, 'succeeded');
  }
  for (const options of [{ missingEtag: true }, { emptyEtag: true }, { deleteStatus: 412 }]) {
    const h = harness(options); const result = await h.run();
    assert.deepEqual(result.report.cleanup.failedChecks, ['event_version']);
    assert.equal(result.report.cleanup.status, 'refused');
  }
});
