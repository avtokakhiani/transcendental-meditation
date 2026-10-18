import 'server-only';

import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies, headers } from 'next/headers';
import { redirect } from 'next/navigation';
import { env } from '@/env';
import { prisma } from '@/server/db';

const SESSION_COOKIE = 'tm_session';
const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60;

interface SessionPayload {
  userId: string;
  expiresAt: number;
}

function sign(payload: string): string {
  return createHmac('sha256', env.AUTH_SECRET).update(payload).digest('base64url');
}

function encodeSession(session: SessionPayload): string {
  const payload = Buffer.from(JSON.stringify(session)).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

function decodeSession(token: string): SessionPayload | null {
  const [payload, signature] = token.split('.');
  if (payload === undefined || signature === undefined) return null;

  const actualBuffer = Buffer.from(signature);
  const expectedBuffer = Buffer.from(sign(payload));
  if (
    actualBuffer.length !== expectedBuffer.length ||
    !timingSafeEqual(actualBuffer, expectedBuffer)
  ) {
    return null;
  }

  try {
    const value = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8')) as Partial<SessionPayload>;
    if (
      typeof value.userId !== 'string' ||
      typeof value.expiresAt !== 'number' ||
      value.expiresAt <= Date.now()
    ) {
      return null;
    }
    return { userId: value.userId, expiresAt: value.expiresAt };
  } catch {
    return null;
  }
}

/**
 * Secure only when the request really arrived over HTTPS. Keying this off NODE_ENV broke login on
 * the local production container (plain http://localhost), where Safari drops Secure cookies.
 * Azure App Service terminates TLS and forwards the original scheme in x-forwarded-proto.
 */
async function isHttpsRequest(): Promise<boolean> {
  const proto = (await headers()).get('x-forwarded-proto')?.split(',')[0]?.trim();
  return proto === 'https';
}

export async function createSession(userId: string): Promise<void> {
  const cookieStore = await cookies();
  const secure = await isHttpsRequest();
  cookieStore.set(
    SESSION_COOKIE,
    encodeSession({ userId, expiresAt: Date.now() + SESSION_TTL_SECONDS * 1000 }),
    {
      httpOnly: true,
      sameSite: 'lax',
      secure,
      path: '/',
      maxAge: SESSION_TTL_SECONDS,
    },
  );
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

export async function getCurrentUser() {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  const session = token === undefined ? null : decodeSession(token);
  if (session === null) return null;

  return prisma.user.findFirst({
    where: { id: session.userId, isActive: true },
    select: { id: true, username: true, firstName: true, lastName: true, role: true },
  });
}

export async function requireUser() {
  const user = await getCurrentUser();
  if (user === null) redirect('/admin/login');
  return user;
}
