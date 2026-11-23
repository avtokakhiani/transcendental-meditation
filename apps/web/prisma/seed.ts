import { PrismaClient } from '@prisma/client';
import { hash } from 'bcryptjs';

/** Explicit, create-only administrator bootstrap. Editorial content is never seeded. */
const prisma = new PrismaClient();

async function main() {
  const existing = await prisma.user.findUnique({ where: { username: 'admin' }, select: { id: true } });
  if (existing) {
    console.log('Administrator account already exists; no records changed.');
    return;
  }

  const adminPassword = process.env.SEED_ADMIN_PASSWORD;
  if (adminPassword === undefined || adminPassword.length < 10) {
    throw new Error('Set SEED_ADMIN_PASSWORD (min 10 characters) before creating the first administrator.');
  }

  await prisma.user.create({
    data: {
      username: 'admin',
      email: 'admin@tm.local',
      passwordHash: await hash(adminPassword, 12),
      firstName: 'ადმინისტრატორი',
      lastName: 'TM',
      role: 'admin',
    },
  });
  console.log('Created initial administrator. No posts, books, or pages were created.');
}

main()
  .catch(() => {
    console.error('Administrator initialization failed. Check database connectivity and SEED_ADMIN_PASSWORD (minimum 10 characters for a new administrator).');
    process.exitCode = 1;
  })
  .finally(() => prisma.$disconnect());
