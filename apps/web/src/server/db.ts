import { PrismaClient } from '@prisma/client';
import { env } from '@/env';

// Next.js dev server reloads modules on every edit; without the global cache each reload would
// open a new connection pool and exhaust Azure SQL Basic's connection limit.
const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  });

if (env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}
