import { randomBytes } from 'node:crypto';
import { setTimeout as delay } from 'node:timers/promises';
import type { ResultCode, Stage } from './google-calendar-test-core';

export const TEST_EVENT_TITLE = 'learnTM Calendar Integration Test';
const EVENTS = 'https://www.googleapis.com/calendar/v3/calendars/primary/events';
const FIELDS = 'id,etag,status,summary,start,end,attendees,recurrence,extendedProperties,conferenceData';
export const VERIFICATION_CHECK_LABELS = {
  event_id: 'Event ID', private_marker: 'Private run marker', title: 'Event title',
  start_time: 'Exact start instant', end_time: 'Exact end instant', attendees: 'No attendees', recurrence: 'No recurrence',
  cancelled: 'Event is not cancelled', event_version: 'Current event version (ETag)',
  meet_type: 'Google Meet conference type', meet_request: 'Conference request identity',
  meet_status: 'Conference generation status', meet_video: 'Valid Google Meet video URL',
} as const;
type VerificationCheck = keyof typeof VERIFICATION_CHECK_LABELS;
type Step = { status: 'not-attempted' | 'succeeded' | 'failed' | 'unknown' | 'refused'; code?: ResultCode; httpStatus?: number; failedChecks?: VerificationCheck[] };
export interface WriteReport {
  eventId: string;
  startsAt: string;
  creation: Step;
  verification: Step;
  meet: Step;
  cleanup: Step & { deleteAttempts?: number; versionConflicts?: number; versionChangedSinceVerification?: boolean; versionChangedAfterConflict?: boolean };
}
interface Failure { code: ResultCode; stage: Stage; httpStatus?: number }
type Classify = (status: number, body: unknown) => ResultCode;
const object = (value: unknown): Record<string, unknown> => value !== null && typeof value === 'object' ? value as Record<string, unknown> : {};

/** Only the freshly generated ID can be read/deleted. The token never leaves this call. */
export async function runCalendarWriteTest(request: typeof fetch, token: string, classify: Classify, now = Date.now, pause: (ms: number) => Promise<unknown> = delay) {
  const eventId = `learntm${randomBytes(16).toString('hex')}`; // Valid Calendar base32hex alphabet.
  const marker = randomBytes(32).toString('hex');
  const conferenceRequestId = randomBytes(16).toString('hex');
  // Use one clock sample at whole-second precision before sending it to Google.
  // Exact comparisons below remain exact; no tolerance or rounding of a retrieved event.
  const startInstant = Math.floor(now() / 1000) * 1000 + 86400000;
  const startsAt = new Date(startInstant).toISOString();
  const endsAt = new Date(startInstant + 10 * 60000).toISOString();
  const report: WriteReport = { eventId, startsAt, creation: { status: 'not-attempted' }, verification: { status: 'not-attempted' }, meet: { status: 'not-attempted' }, cleanup: { status: 'not-attempted' } };
  let verifiedEtag: string | undefined;
  let mayExist = false;
  let failure: Failure | undefined;
  let stage: Stage = 'calendar-create';

  const call = async (url: URL, method: string, body?: unknown, etag?: string) => {
    const response = await request(url, {
      method, cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(10000),
      headers: { Authorization: `Bearer ${token}`, ...(body ? { 'Content-Type': 'application/json' } : {}), ...(etag ? { 'If-Match': etag } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    // DELETE normally returns no body. Never log raw error bodies or thrown exceptions.
    let value: Record<string, unknown> = {};
    if (response.status !== 204) { try { value = object(await response.json()); } catch { /* Handled as an invalid response. */ } }
    return { ok: response.ok, status: response.status, body: value };
  };
  const eventUrl = () => { const url = new URL(`${EVENTS}/${eventId}`); url.searchParams.set('fields', FIELDS); return url; };
  const isOurs = (event: Record<string, unknown>) => event.id === eventId && object(object(event.extendedProperties).private).learnTMLocalTest === marker;
  const sameInstant = (actual: unknown, expected: string) => typeof actual === 'string' && Date.parse(actual) === Date.parse(expected);
  const eventFailures = (event: Record<string, unknown>): VerificationCheck[] => {
    const checks: [VerificationCheck, boolean][] = [
      ['event_id', event.id === eventId], ['private_marker', object(object(event.extendedProperties).private).learnTMLocalTest === marker],
      ['title', event.summary === TEST_EVENT_TITLE],
      ['start_time', sameInstant(object(event.start).dateTime, startsAt)], ['end_time', sameInstant(object(event.end).dateTime, endsAt)],
      ['attendees', event.attendees === undefined || (Array.isArray(event.attendees) && event.attendees.length === 0)],
      ['recurrence', event.recurrence === undefined || (Array.isArray(event.recurrence) && event.recurrence.length === 0)],
    ];
    return checks.filter(([, passed]) => !passed).map(([name]) => name);
  };
  const meetFailures = (event: Record<string, unknown>): VerificationCheck[] => {
    const conference = object(event.conferenceData);
    const video = Array.isArray(conference.entryPoints) && conference.entryPoints.some(entry => {
      const point = object(entry);
      if (point.entryPointType !== 'video' || typeof point.uri !== 'string') return false;
      try { const url = new URL(point.uri); return url.protocol === 'https:' && url.hostname === 'meet.google.com' && url.port === '' && !url.username && !url.password && /^\/[a-z]{3}-[a-z]{4}-[a-z]{3}$/.test(url.pathname); }
      catch { return false; }
    });
    const checks: [VerificationCheck, boolean][] = [
      ['meet_type', object(object(conference.conferenceSolution).key).type === 'hangoutsMeet'],
      ['meet_request', object(conference.createRequest).requestId === conferenceRequestId],
      ['meet_status', object(object(conference.createRequest).status).statusCode === 'success'], ['meet_video', video],
    ];
    return checks.filter(([, passed]) => !passed).map(([name]) => name);
  };

  const cleanup = async () => {
    if (!mayExist) return;
    let deleteAttempts = 0;
    let versionConflicts = 0;
    let versionChangedSinceVerification = false;
    let versionChangedAfterConflict = false;
    let conflictedEtag: string | undefined;
    try {
      // Only a definite precondition failure permits another mutation attempt.
      // Every attempt gets a fresh, fully validated snapshot and its own If-Match.
      for (let attempt = 0; attempt < 3; attempt++) {
        if (attempt > 0) await pause(attempt * 250);
        const current = await call(eventUrl(), 'GET');
        if (current.status === 404 || current.status === 410) { report.cleanup = { status: 'succeeded', httpStatus: current.status }; return; }
        if (!current.ok) { report.cleanup = { status: 'failed', code: classify(current.status, current.body), httpStatus: current.status }; return; }
        const failedChecks = eventFailures(current.body);
        const etag = typeof current.body.etag === 'string' && current.body.etag.trim() ? current.body.etag : undefined;
        if (!etag) failedChecks.push('event_version');
        if (failedChecks.length > 0) {
          report.cleanup = { status: 'refused', code: 'cleanup_refused', failedChecks }; return;
        }
        if (attempt === 0 && verifiedEtag !== undefined) versionChangedSinceVerification = etag !== verifiedEtag;
        if (conflictedEtag !== undefined && etag !== conflictedEtag) versionChangedAfterConflict = true;
        // A recovered matching event proves creation even if the POST response was lost.
        if (report.creation.status !== 'succeeded') report.creation = { status: 'succeeded', httpStatus: current.status };
        if (current.body.status === 'cancelled') { report.cleanup = { status: 'succeeded', httpStatus: current.status }; return; }
        const deletion = new URL(`${EVENTS}/${eventId}`);
        deletion.searchParams.set('sendUpdates', 'none');
        let deletionFailure: Step | undefined;
        try {
          deleteAttempts++;
          const response = await call(deletion, 'DELETE', undefined, etag!);
          if (response.status === 412) {
            versionConflicts++;
            conflictedEtag = etag;
            if (attempt < 2) continue; // Re-fetch and revalidate; never reuse the rejected snapshot.
          }
          if (!response.ok && response.status !== 404 && response.status !== 410) deletionFailure = {
            status: response.status === 412 ? 'refused' : 'failed', code: response.status === 412 ? 'cleanup_refused' : classify(response.status, response.body), httpStatus: response.status,
            ...(response.status === 412 ? { failedChecks: ['event_version'] as VerificationCheck[] } : {}),
          };
        } catch { deletionFailure = { status: 'unknown', code: 'network_error' }; }
        // Confirm absence after completion or an ambiguous response. Never retry lost responses.
        const after = await call(eventUrl(), 'GET');
        if (after.status === 404 || after.status === 410 || (after.ok && after.body.id === eventId && after.body.status === 'cancelled')) {
          report.cleanup = { status: 'succeeded', httpStatus: after.status }; return;
        }
        report.cleanup = deletionFailure ?? { status: 'failed', code: after.ok ? 'cleanup_unverified' : classify(after.status, after.body), httpStatus: after.status };
        return;
      }
    } catch { report.cleanup = { status: 'unknown', code: 'network_error' }; }
    finally {
      // Retain counts/booleans only, never raw ETags, event bodies, or tokens.
      Object.assign(report.cleanup, { deleteAttempts, versionConflicts, versionChangedSinceVerification, versionChangedAfterConflict });
    }
  };

  try {
    const insert = new URL(EVENTS);
    insert.search = new URLSearchParams({ conferenceDataVersion: '1', sendUpdates: 'none', fields: FIELDS }).toString();
    const payload = {
      id: eventId, summary: TEST_EVENT_TITLE,
      description: `Temporary learnTM localhost test. Run reference: ${eventId}. No participants invited.`,
      start: { dateTime: startsAt }, end: { dateTime: endsAt }, visibility: 'private', transparency: 'transparent',
      reminders: { useDefault: false, overrides: [] },
      extendedProperties: { private: { learnTMLocalTest: marker } },
      conferenceData: { createRequest: { requestId: conferenceRequestId, conferenceSolutionKey: { type: 'hangoutsMeet' } } },
    };
    mayExist = true;
    report.creation = { status: 'unknown' };
    const created = await call(insert, 'POST', payload); // Exactly one insert; never retried.
    if (!created.ok) {
      report.creation = { status: 'failed', code: classify(created.status, created.body), httpStatus: created.status };
      // A rejected/colliding insert must never cause deletion of an existing resource.
      mayExist = created.status >= 500 || created.status === 408;
      failure = { code: report.creation.code!, stage, httpStatus: created.status };
    } else {
      report.creation = { status: isOurs(created.body) ? 'succeeded' : 'unknown', httpStatus: created.status };
      stage = 'calendar-verify';
      for (let attempt = 0; attempt < 8; attempt++) {
        if (attempt > 0) await pause(2000);
        const event = await call(eventUrl(), 'GET');
        if (!event.ok) {
          failure = { code: classify(event.status, event.body), stage, httpStatus: event.status };
          report.verification = { status: 'failed', code: failure.code, httpStatus: event.status }; break;
        }
        const failedChecks = eventFailures(event.body);
        if (event.body.status === 'cancelled') failedChecks.push('cancelled');
        if (failedChecks.length > 0) {
          failure = { code: 'event_verification_failed', stage, httpStatus: event.status };
          report.verification = { status: 'failed', code: failure.code, httpStatus: event.status, failedChecks }; break;
        }
        verifiedEtag = typeof event.body.etag === 'string' ? event.body.etag : undefined;
        report.verification = { status: 'succeeded', httpStatus: event.status };
        report.creation = { ...report.creation, status: 'succeeded' };
        const failedMeetChecks = meetFailures(event.body);
        if (failedMeetChecks.length === 0) { report.meet = { status: 'succeeded', httpStatus: event.status }; break; }
        report.meet = { status: 'unknown', httpStatus: event.status, failedChecks: failedMeetChecks };
        if (object(object(object(event.body.conferenceData).createRequest).status).statusCode === 'failure') {
          failure = { code: 'meet_failed', stage, httpStatus: event.status }; break;
        }
        if (attempt === 7) failure = { code: 'meet_timeout', stage, httpStatus: event.status };
      }
      if (failure && report.verification.status === 'succeeded') report.meet = { ...report.meet, status: 'failed', code: failure.code, httpStatus: failure.httpStatus };
    }
  } catch {
    failure = { code: 'network_error', stage };
    if (stage === 'calendar-verify') {
      if (report.verification.status === 'succeeded') report.meet = { status: 'unknown', code: 'network_error' };
      else report.verification = { status: 'unknown', code: 'network_error' };
    }
  } finally {
    await cleanup(); // Runs after every accepted or ambiguous insert, including failed verification.
  }
  if (!failure && report.cleanup.status !== 'succeeded') failure = { code: 'cleanup_failed', stage: 'calendar-cleanup', httpStatus: report.cleanup.httpStatus };
  return { report, ...(failure ?? { code: 'write_success' as const, stage: 'calendar-cleanup' as const }) };
}
