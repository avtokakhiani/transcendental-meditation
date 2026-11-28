import { NextResponse } from 'next/server';
import { connectivity, PRIVATE_HEADERS, testActor } from '@/server/google-calendar-test';
import { TEST_ORIGIN, TEST_PATH } from '@/server/google-calendar-test-core';

export async function POST(request: Request) {
  const actor = await testActor();
  if (actor.status !== 200) return new Response(null, { status: actor.status, headers: PRIVATE_HEADERS });
  if (request.headers.get('origin') !== TEST_ORIGIN) return new Response(null, { status: 403, headers: PRIVATE_HEADERS });
  if (!connectivity.clear(actor.owner)) return new Response('Wait for the running Calendar test to finish cleanup.', { status: 409, headers: PRIVATE_HEADERS });
  return NextResponse.redirect(`${TEST_ORIGIN}${TEST_PATH}`, { status: 303, headers: PRIVATE_HEADERS });
}
