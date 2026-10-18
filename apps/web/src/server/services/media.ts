import type { PrismaClient } from '@prisma/client';

export function mediaUrl(id: string): string {
  return `/api/media/${id}`;
}

export async function recordMedia(
  db: PrismaClient,
  data: { blobName: string; contentType: string; byteSize: number; originalName: string; uploadedById: string },
): Promise<{ id: string; url: string }> {
  const row = await db.media.create({ data, select: { id: true } });
  return { id: row.id, url: mediaUrl(row.id) };
}

export async function findMedia(db: PrismaClient, id: string) {
  return db.media.findUnique({ where: { id }, select: { blobName: true, contentType: true } });
}

export async function listRecentMedia(db: PrismaClient, take = 60) {
  const rows = await db.media.findMany({
    orderBy: { createdAt: 'desc' },
    take,
    select: { id: true, originalName: true, byteSize: true, createdAt: true },
  });
  return rows.map((row) => ({ ...row, url: mediaUrl(row.id) }));
}
