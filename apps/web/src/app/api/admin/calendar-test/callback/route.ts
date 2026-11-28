import { NextRequest, NextResponse } from 'next/server';
import { connectivity, FLOW_COOKIE, PRIVATE_HEADERS, testActor } from '@/server/google-calendar-test';
import { CALLBACK_PATH, TEST_ORIGIN, TEST_PATH } from '@/server/google-calendar-test-core';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  const actor = await testActor();
  if (actor.status !== 200) return new Response(null, { status: actor.status, headers: PRIVATE_HEADERS });
  await connectivity.complete(actor.owner, request.cookies.get(FLOW_COOKIE)?.value, request.nextUrl.searchParams);
  // Remove the authorization code from the address bar before rendering any HTML or assets.
  const response = NextResponse.redirect(`${TEST_ORIGIN}${TEST_PATH}`, { status: 303, headers: { ...PRIVATE_HEADERS, 'X-Calendar-Test-Implementation': connectivity.implementationRevision } });
  response.cookies.set(FLOW_COOKIE, '', { httpOnly: true, sameSite: 'lax', secure: false, path: CALLBACK_PATH, maxAge: 0 });
  return response;
}
