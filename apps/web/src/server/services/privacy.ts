import type { PrismaClient } from '@prisma/client';
import { PRIVACY_LOG_DAYS, type PrivateRecordScope } from '@/lib/privacy-retention';
import { appendErasure, readErasureLedger, type ErasureEntry } from '@/server/privacy-files';

export async function reapplyErasureLedger(db: PrismaClient) {
  for (const entry of await readErasureLedger()) {
    await db.$transaction(async tx => {
      // Serialize replay with notification delivery. A previously completed
      // erasure takes precedence over restrictions/holds resurrected by a backup.
      if (entry.scope === 'registration') await tx.$queryRaw`SELECT [id] FROM [dbo].[meeting_registrations] WITH (UPDLOCK, HOLDLOCK) WHERE [id] = ${entry.targetId}`;
      else await tx.$queryRaw`SELECT [id] FROM [dbo].[corporate_inquiries] WITH (UPDLOCK, HOLDLOCK) WHERE [id] = ${entry.targetId}`;
      const record = entry.scope === 'registration'
        ? await tx.meetingRegistration.findUnique({ where: { id: entry.targetId } })
        : await tx.corporateInquiry.findUnique({ where: { id: entry.targetId } });
      // Receipt IDs in newer independent journals also recover deletion tasks
      // when the backup predates delivery. Legacy journals remain readable.
      const receipts = [...new Set([...(entry.externalEmailIds || []), record?.adminEmailId,
        record && 'participantEmailId' in record ? record.participantEmailId : null].filter((id): id is string => !!id))];
      const task = await tx.privacyErasure.findFirst({ where: { scope: entry.scope, targetId: entry.targetId } });
      if (!task) {
        await tx.privacyErasure.create({ data: { scope: entry.scope, targetId: entry.targetId,
          createdAt: new Date(entry.deletedAt), externalEmailIds: receipts.length ? JSON.stringify(receipts) : null } });
      } else if (receipts.length) {
        const existing = task.externalEmailIds ? JSON.parse(task.externalEmailIds) as string[] : [];
        if (receipts.some(id => !existing.includes(id))) await tx.privacyErasure.update({ where: { id: task.id }, data: {
          externalEmailIds: JSON.stringify([...new Set([...existing, ...receipts])]), externalDoneAt: null,
        } });
      }
      if (entry.scope === 'registration') await tx.meetingRegistration.deleteMany({ where: { id: entry.targetId } });
      else await tx.corporateInquiry.deleteMany({ where: { id: entry.targetId } });
    });
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
    const ids = [record.adminEmailId, 'participantEmailId' in record ? record.participantEmailId : null].filter((value): value is string => !!value);
    await (options.journal || appendErasure)({ scope, targetId: id, deletedAt: now.toISOString(), ...(ids.length ? { externalEmailIds: ids } : {}) });
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
