import { NextResponse } from 'next/server';
import { configuration, connectivity, FLOW_COOKIE, PRIVATE_HEADERS, testActor } from '@/server/google-calendar-test';
import { CALLBACK_PATH, FLOW_TTL, TEST_ORIGIN } from '@/server/google-calendar-test-core';

export const runtime = 'nodejs';

export async function POST(request: Request) {
  const actor = await testActor();
  if (actor.status !== 200) return new Response(null, { status: actor.status, headers: PRIVATE_HEADERS });
  if (request.headers.get('origin') !== TEST_ORIGIN) return new Response(null, { status: 403, headers: PRIVATE_HEADERS });
  if (connectivity.isRunning(actor.owner)) return new Response('A Calendar test is already running.', { status: 409, headers: PRIVATE_HEADERS });
  const config = configuration();
  if (!config) return new Response('Local OAuth setup is incomplete. See the admin test page.', { status: 503, headers: PRIVATE_HEADERS });
  try {
    const { state, url } = connectivity.begin(actor.owner, config);
    const response = NextResponse.redirect(url, { status: 303, headers: PRIVATE_HEADERS });
    response.cookies.set(FLOW_COOKIE, state, { httpOnly: true, sameSite: 'lax', secure: false, path: CALLBACK_PATH, maxAge: FLOW_TTL / 1000 });
    return response;
  } catch {
    return new Response('Unable to start another local test. Restart the dev server and retry.', { status: 503, headers: PRIVATE_HEADERS });
  }
}
