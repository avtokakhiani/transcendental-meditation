import { CalendarConnectivityTest, WRITE_SCOPES } from './google-calendar-test-core';

/** Offline execution probe. Every request and identity check is synthetic; no network fallback. */
export async function probeCalendarRuntime(Engine: typeof CalendarConnectivityTest) {
  let nonce = '';
  let event: Record<string, unknown> | undefined;
  let expected: Record<string, unknown> | undefined;
  let firstRetrievalChecks: Record<string, boolean> | undefined;
  let deleteAttempts = 0;
  const engine = new Engine(async (input, init) => {
    const url = new URL(String(input));
    if (url.origin === 'https://oauth2.googleapis.com' && url.pathname === '/token') return Response.json({
      access_token: 'synthetic-runtime-probe', id_token: 'synthetic-runtime-identity', token_type: 'Bearer', scope: WRITE_SCOPES.join(' '),
    });
    if (url.origin !== 'https://www.googleapis.com' || !url.pathname.startsWith('/calendar/v3/calendars/primary/events')) throw new Error('Offline probe refuses unsupported requests');
    if (init?.method === 'POST') {
      const payload = JSON.parse(String(init.body));
      expected = payload;
      event = { ...payload, status: 'confirmed', etag: '"synthetic-version"',
        start: { dateTime: new Date(Math.floor(Date.parse(payload.start.dateTime) / 1000) * 1000).toISOString() },
        end: { dateTime: new Date(Math.floor(Date.parse(payload.end.dateTime) / 1000) * 1000).toISOString() },
        conferenceData: { createRequest: { requestId: payload.conferenceData.createRequest.requestId, status: { statusCode: 'success' } },
          conferenceSolution: { key: { type: 'hangoutsMeet' } }, entryPoints: [{ entryPointType: 'video', uri: 'https://meet.google.com/abc-defg-hij' }] },
      };
      return Response.json(event);
    }
    if (init?.method === 'DELETE') {
      deleteAttempts++;
      if (!event || new Headers(init.headers).get('If-Match') !== event.etag) throw new Error('Offline probe requires the current conditional version');
      if (deleteAttempts === 1) {
        event.etag = '"synthetic-updated-version"';
        return Response.json({ error: {} }, { status: 412 });
      }
      event = undefined; return new Response(null, { status: 204 });
    }
    if (init?.method === 'GET') {
      if (event && expected && !firstRetrievalChecks) {
        const privateMarker = (value: Record<string, unknown>) => (value.extendedProperties as { private: { learnTMLocalTest: string } }).private.learnTMLocalTest;
        const instant = (value: Record<string, unknown>, field: string) => Date.parse((value[field] as { dateTime: string }).dateTime);
        firstRetrievalChecks = {
          event_id: event.id === expected.id, private_marker: privateMarker(event) === privateMarker(expected), title: event.summary === expected.summary,
          start_time: instant(event, 'start') === instant(expected, 'start'), end_time: instant(event, 'end') === instant(expected, 'end'),
          attendees: event.attendees === undefined, recurrence: event.recurrence === undefined,
        };
      }
      return event ? Response.json(event) : Response.json({ error: {} }, { status: 404 });
    }
    throw new Error('Offline probe refuses unsupported methods');
  }, async () => ({ nonce, email: 'runtime-probe@tmgeorgia.ge', email_verified: true, hd: 'tmgeorgia.ge' }), () => Date.parse('2026-11-23T18:17:09.749Z'));
  const flow = engine.begin('offline-probe', { clientId: 'synthetic.apps.googleusercontent.com', clientSecret: 'synthetic-only', email: 'runtime-probe@tmgeorgia.ge' }, 'write');
  nonce = new URL(flow.url).searchParams.get('nonce')!;
  const result = await engine.complete('offline-probe', flow.state, new URLSearchParams({ state: flow.state, code: 'synthetic-only' }));
  return {
    offline: true, result: result.code,
    implementation: result.implementation ?? 'legacy-no-revision',
    scheduledStart: result.write?.startsAt,
    fractionalMilliseconds: result.write ? Date.parse(result.write.startsAt) % 1000 : undefined,
    verification: result.write?.verification?.status ?? 'legacy-no-diagnostics',
    failedChecks: result.write?.verification?.failedChecks ?? [],
    firstRetrievalChecks,
    meet: result.write?.meet.status, cleanup: result.write?.cleanup.status,
    deleteAttempts, versionConflicts: result.write?.cleanup.versionConflicts,
    versionChangedAfterConflict: result.write?.cleanup.versionChangedAfterConflict,
  };
}
