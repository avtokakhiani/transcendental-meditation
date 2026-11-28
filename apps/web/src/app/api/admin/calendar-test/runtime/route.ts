import { CalendarConnectivityTest } from '@/server/google-calendar-test-core';
import { connectivity, PRIVATE_HEADERS, testActor } from '@/server/google-calendar-test';
import { probeCalendarRuntime } from '@/server/google-calendar-runtime-probe';

export const runtime = 'nodejs';

export async function GET() {
  const actor = await testActor();
  if (actor.status !== 200) return new Response(null, { status: actor.status, headers: PRIVATE_HEADERS });
  return Response.json({
    implementation: connectivity.implementationRevision,
    loadedEngineMatchesCurrentClass: connectivity.constructor === CalendarConnectivityTest,
    loadedEngine: await probeCalendarRuntime(connectivity.constructor as typeof CalendarConnectivityTest),
    currentCode: await probeCalendarRuntime(CalendarConnectivityTest),
  }, { headers: PRIVATE_HEADERS });
}
