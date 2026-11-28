'use server';

import { z } from 'zod';
import { prisma } from '@/server/db';
import { requirePrivacyAdministrator } from '@/server/auth';
import { enforcePrivacyRetention, erasePrivateRecord } from '@/server/services/privacy';
import { prunePrivacyFiles } from '@/server/privacy-files';
import { twelveMonthsAfter, type PrivateRecordScope } from '@/lib/privacy-retention';
import { corporateInquirySchema } from '@/lib/corporate-inquiry';
import { registrationSchema } from '@/lib/meetings';
import { notifyCorporateInquiry } from '@/server/corporate-notifications';
import { notifyMeetingRegistration } from '@/server/meeting-notifications';

export interface PrivateRecordView {
  id: string; scope: PrivateRecordScope; values: Record<string, string>;
  expiresAt: string; holdUntil: string; restricted: boolean;
}
export interface PrivacyActionState { error?: string; message?: string; records?: PrivateRecordView[]; removed?: boolean; exportData?: string }

export async function searchPrivacyRecords(_previous: PrivacyActionState, data: FormData): Promise<PrivacyActionState> {
  const user = await requirePrivacyAdministrator();
  const email = z.email().safeParse(String(data.get('email') || '').trim().toLowerCase());
  if (!email.success) return { error: 'შეიყვანე სწორი ელფოსტა.' };
  await enforcePrivacyRetention(prisma);
  const registrations = await prisma.meetingRegistration.findMany({ where: { email: email.data } });
  const inquiries = await prisma.corporateInquiry.findMany({ where: { email: email.data } });
  await prisma.privacyAudit.create({ data: { actorId: user.id, scope: 'rights', action: 'access_lookup' } });
  return { records: [
    ...registrations.map(record => ({ id: record.id, scope: 'registration' as const, values: {
      firstName: record.firstName, lastName: record.lastName, email: record.email, phone: record.phone,
      meetingId: record.meetingId, createdAt: record.createdAt.toISOString(),
    }, expiresAt: record.retentionExpiresAt.toISOString(), holdUntil: record.holdUntil?.toISOString() || '', restricted: Boolean(record.processingRestrictedAt) })),
    ...inquiries.map(record => ({ id: record.id, scope: 'corporate' as const, values: {
      name: record.name, organization: record.organization, email: record.email, phone: record.phone,
      contactMethod: record.contactMethod, message: record.message, createdAt: record.createdAt.toISOString(), lastBusinessContactAt: record.lastBusinessContactAt.toISOString(),
    }, expiresAt: record.retentionExpiresAt.toISOString(), holdUntil: record.holdUntil?.toISOString() || '', restricted: Boolean(record.processingRestrictedAt) })),
  ] };
}

export async function changePrivacyRecord(_previous: PrivacyActionState, data: FormData): Promise<PrivacyActionState> {
  const actor = await requirePrivacyAdministrator();
  const parsed = z.object({ id: z.uuid(), scope: z.enum(['registration', 'corporate']), operation: z.enum(['delete', 'restrict', 'unrestrict', 'hold', 'release_hold', 'mark_contact', 'update', 'export', 'notify']), confirmed: z.literal('yes') }).safeParse(Object.fromEntries(data));
  if (!parsed.success) return { error: 'დაადასტურე მოთხოვნისა და ვინაობის გადამოწმება.' };
  const { id, scope, operation } = parsed.data, now = new Date();
  try {
    if (operation === 'delete') {
      await erasePrivateRecord(prisma, scope, id, { actorId: actor.id });
      return { message: 'აქტიური ჩანაწერი წაშლილია. გარე ასლების დავალებები შეამოწმე ქვემოთ; სარეზერვო ასლების ციკლი მაქსიმუმ 30 დღეა.', removed: true };
    }
    if (operation === 'notify') {
      if (scope === 'registration') await notifyMeetingRegistration(id); else await notifyCorporateInquiry(id);
      return { message: 'გაგზავნის მცდელობა დასრულდა. კონფიგურაცია და მიღების სტატუსი გადაამოწმე.' };
    }
    let exported: string | undefined;
    await prisma.$transaction(async tx => {
      if (scope === 'registration') await tx.$queryRaw`SELECT [id] FROM [dbo].[meeting_registrations] WITH (UPDLOCK, HOLDLOCK) WHERE [id] = ${id}`;
      else await tx.$queryRaw`SELECT [id] FROM [dbo].[corporate_inquiries] WITH (UPDLOCK, HOLDLOCK) WHERE [id] = ${id}`;
      const record = scope === 'registration' ? await tx.meetingRegistration.findUnique({ where: { id } }) : await tx.corporateInquiry.findUnique({ where: { id } });
      if (!record) throw new Error('missing');
      if (operation === 'export') {
        const subjectData = Object.fromEntries(Object.entries(record).filter(([key]) => !['adminEmailId', 'participantEmailId', 'deduplicationKey'].includes(key)));
        exported = JSON.stringify(subjectData, null, 2);
      } else {
        let update: Record<string, unknown> = {};
        if (operation === 'restrict') update = { processingRestrictedAt: now };
        if (operation === 'unrestrict') update = { processingRestrictedAt: null };
        if (operation === 'release_hold') update = { holdUntil: null, holdReason: null };
        if (operation === 'hold') {
          const holdUntil = z.coerce.date().parse(`${String(data.get('holdUntil'))}:00+04:00`);
          const holdReason = z.enum(['legal_obligation', 'security_incident']).parse(data.get('holdReason'));
          if (holdUntil <= now) throw new Error('date');
          update = { holdUntil, holdReason };
        }
        if (operation === 'mark_contact') {
          if (scope !== 'corporate') throw new Error('scope');
          update = { lastBusinessContactAt: now, retentionExpiresAt: twelveMonthsAfter(now) };
        }
        if (operation === 'update') {
          if (scope === 'registration') {
            const input = registrationSchema.parse({ ...Object.fromEntries(data), meetingId: 'meetingId' in record ? record.meetingId : '' });
            update = { firstName: input.firstName, lastName: input.lastName, email: input.email, phone: input.phone };
          } else {
            const input = corporateInquirySchema.parse({ ...Object.fromEntries(data), website: '', startedAt: Date.now() });
            update = { name: input.name, organization: input.organization, email: input.email.toLowerCase(), phone: input.phone, contactMethod: input.contactMethod, message: input.message };
          }
        }
        if (scope === 'registration') await tx.meetingRegistration.update({ where: { id }, data: update });
        else await tx.corporateInquiry.update({ where: { id }, data: update });
      }
      await tx.privacyAudit.create({ data: { actorId: actor.id, scope, targetId: id, action: operation } });
    });
    return { message: 'ოპერაცია შესრულებულია. განახლებული მონაცემებისთვის ძებნა გაიმეორე.', exportData: exported };
  } catch { return { error: 'ოპერაცია ვერ შესრულდა. გადაამოწმე ველები და შენახვის გამონაკლისი; მოქმედი გამონაკლისისას წაშლა დაბლოკილია.' }; }
}

export async function runPrivacyCleanup(_previous: PrivacyActionState, data: FormData): Promise<PrivacyActionState> {
  await requirePrivacyAdministrator();
  if (data.get('confirmed') !== 'yes') return { error: 'დაადასტურე ოპერაცია.' };
  const result = await enforcePrivacyRetention(prisma);
  await prunePrivacyFiles();
  return { message: `წაშლილია რეგისტრაციები: ${result.registrations}; ორგანიზაციების მოთხოვნები: ${result.corporate}.` };
}

export async function acknowledgeExternalDeletion(data: FormData) {
  const user = await requirePrivacyAdministrator();
  if (data.get('confirmed') !== 'yes') return;
  const id = z.uuid().parse(data.get('id'));
  await prisma.$transaction([
    prisma.privacyErasure.update({ where: { id }, data: { externalDoneAt: new Date() } }),
    prisma.privacyAudit.create({ data: { scope: 'external_erasure', targetId: id, actorId: user.id, action: 'verified_completion' } }),
  ]);
}
