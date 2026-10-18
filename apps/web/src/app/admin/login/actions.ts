'use server';

import { compare } from 'bcryptjs';
import { redirect } from 'next/navigation';
import { createSession, destroySession } from '@/server/auth';
import { prisma } from '@/server/db';

export async function logoutAction(): Promise<void> {
  await destroySession();
  redirect('/admin/login');
}

export async function loginAction(formData: FormData): Promise<void> {
  const username = formData.get('username');
  const password = formData.get('password');
  if (typeof username !== 'string' || typeof password !== 'string') {
    redirect('/admin/login?error=invalid');
  }

  const user = await prisma.user.findUnique({
    where: { username: username.trim().toLowerCase() },
    select: { id: true, passwordHash: true, isActive: true },
  });

  const valid = user !== null && user.isActive && (await compare(password, user.passwordHash));
  if (!valid || user === null) redirect('/admin/login?error=invalid');

  await prisma.user.update({ where: { id: user.id }, data: { lastLoginAt: new Date() } });
  await createSession(user.id);
  redirect('/admin/posts');
}
