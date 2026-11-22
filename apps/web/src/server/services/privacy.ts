import type { PrismaClient } from '@prisma/client';
import { PRIVACY_LOG_DAYS, type PrivateRecordScope } from '@/lib/privacy-retention';
import { appendErasure, readErasureLedger, type ErasureEntry } from '@/server/privacy-files';

export async function reapplyErasureLedger(db: PrismaClient) {
  for (const entry of await readErasureLedger()) {
    if (entry.scope === 'registration') await db.meetingRegistration.deleteMany({ where: { id: entry.targetId } });
    else await db.corporateInquiry.deleteMany({ where: { id: entry.targetId } });
  }
}

export async function erasePrivateRecord(db: PrismaClient, scope: PrivateRecordScope, id: string, options: {
  actorId?: string; now?: Date; expiredOnly?: boolean; journal?: (entry: ErasureEntry) => Promise<void>;
} = {}) {
  const now = options.now || new Date();
  return db.$transaction(async tx => {
    if (scope === 'registration') await tx.$queryRaw`SELECT [id] FROM [dbo].[meeting_registrations] WITH (UPDLOCK, HOLDLOCK) WHERE [id] = ${id}`;
    else await tx.$queryRaw`SELECT [id] FROM [dbo].[corporate_inquiries] WITH (UPDLOCK, HOLDLOCK) WHERE [id] = ${id}`;
    const record = scope === 'registration'
      ? await tx.meetingRegistration.findUnique({ where: { id } }) : await tx.corporateInquiry.findUnique({ where: { id } });
    if (!record) return false;
    if (record.holdUntil && record.holdUntil > now) {
      if (options.expiredOnly) return false;
      throw new Error('Record has a documented preservation hold');
    }
    if (options.expiredOnly && record.retentionExpiresAt > now) return false;
    const ids = [record.adminEmailId, 'participantEmailId' in record ? record.participantEmailId : null].filter(Boolean);
    await (options.journal || appendErasure)({ scope, targetId: id, deletedAt: now.toISOString() });
    await tx.privacyErasure.create({ data: { scope, targetId: id, createdAt: now, externalEmailIds: ids.length ? JSON.stringify(ids) : null } });
    await tx.privacyAudit.create({ data: { scope, targetId: id, actorId: options.actorId, action: options.expiredOnly ? 'retention_erasure' : 'requested_erasure', createdAt: now } });
    if (scope === 'registration') await tx.meetingRegistration.delete({ where: { id } });
    else await tx.corporateInquiry.delete({ where: { id } });
    return true;
  });
}

export async function enforcePrivacyRetention(db: PrismaClient, now = new Date(), journal?: (entry: ErasureEntry) => Promise<void>) {
  const where = { retentionExpiresAt: { lte: now }, OR: [{ holdUntil: null }, { holdUntil: { lte: now } }] };
  let registrations = 0, corporate = 0;
  for (const scope of ['registration', 'corporate'] as const) {
    while (true) {
      const records = scope === 'registration'
        ? await db.meetingRegistration.findMany({ where, select: { id: true }, take: 100 })
        : await db.corporateInquiry.findMany({ where, select: { id: true }, take: 100 });
      if (!records.length) break;
      for (const record of records) {
        if (await erasePrivateRecord(db, scope, record.id, { now, expiredOnly: true, journal })) {
          if (scope === 'registration') registrations++; else corporate++;
        }
      }
    }
  }
  const cutoff = new Date(now.getTime() - PRIVACY_LOG_DAYS * 86400000);
  await db.privacyAudit.deleteMany({ where: { createdAt: { lte: cutoff } } });
  await db.privacyErasure.deleteMany({ where: { createdAt: { lte: cutoff }, OR: [{ externalEmailIds: null }, { externalDoneAt: { not: null } }] } });
  return { registrations, corporate };
}
