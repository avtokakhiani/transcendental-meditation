import 'server-only';
import { createHash } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { getCurrentUser } from '@/server/auth';
import { CalendarConnectivityTest, createCalendarTestState, TEST_ORIGIN } from './google-calendar-test-core';
import type { CalendarTestState, TestConfig } from './google-calendar-test-core';

export const FLOW_COOKIE = 'tm_calendar_test_state';
export const PRIVATE_HEADERS = { 'Cache-Control': 'private, no-store', 'Referrer-Policy': 'no-referrer', 'X-Robots-Tag': 'noindex, nofollow' };

// Cache data only. A cached class instance retains old methods/import closures through HMR.
// Recreate the engine on module evaluation so every reload uses current executable code.
const local = globalThis as typeof globalThis & {
  calendarConnectivityTestV2?: CalendarConnectivityTest;
  calendarConnectivityState?: CalendarTestState;
};
local.calendarConnectivityState ??= local.calendarConnectivityTestV2
  ? CalendarConnectivityTest.stateOf(local.calendarConnectivityTestV2)
  : createCalendarTestState();
delete local.calendarConnectivityTestV2;
export const connectivity = new CalendarConnectivityTest(undefined, undefined, undefined, local.calendarConnectivityState);

export function testEnabled() {
  return process.env.NODE_ENV === 'development' && process.env.GOOGLE_CALENDAR_TEST_ENABLED === 'true';
}

export function configuration(): TestConfig | null {
  const clientId = process.env.GOOGLE_CALENDAR_TEST_CLIENT_ID?.trim();
  const clientSecret = process.env.GOOGLE_CALENDAR_TEST_CLIENT_SECRET?.trim();
  const email = process.env.GOOGLE_CALENDAR_TEST_EMAIL?.trim().toLowerCase();
  if (!clientId?.endsWith('.apps.googleusercontent.com') || !clientSecret || !email || !/^[^\s@]+@tmgeorgia\.ge$/.test(email)) return null;
  return { clientId, clientSecret, email };
}

export async function testActor() {
  if (!testEnabled() || (await headers()).get('host') !== new URL(TEST_ORIGIN).host) return { status: 404 as const };
  const user = await getCurrentUser();
  if (!user) return { status: 401 as const };
  if (user.role !== 'admin') return { status: 403 as const };
  // Bind the transaction and result to the exact signed admin login session, not only user ID.
  const session = (await cookies()).get('tm_session')?.value ?? '';
  const owner = createHash('sha256').update(`${user.id}:${session}`).digest('hex');
  return { status: 200 as const, owner };
}
