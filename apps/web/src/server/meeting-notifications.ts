import type { PrismaClient } from '@prisma/client';
import { formatMeetingDate } from '@/lib/meetings';
import { prisma } from '@/server/db';
import { privateAdminUrl, sendNotificationEmail } from '@/server/notification-email';

/** Row locks serialize delivery against restriction and erasure; receipts support external deletion requests. */
export async function notifyMeetingRegistration(id: string, db: PrismaClient = prisma) {
  const from = process.env.MEETINGS_FROM_EMAIL || process.env.CORPORATE_FROM_EMAIL;
  if (!process.env.RESEND_API_KEY || !from) return;
  await db.$transaction(async tx => {
    await tx.$queryRaw`SELECT [id] FROM [dbo].[meeting_registrations] WITH (UPDLOCK, HOLDLOCK) WHERE [id] = ${id}`;
    const registration = await tx.meetingRegistration.findUnique({ where: { id }, include: { meeting: true } });
    if (!registration || registration.processingRestrictedAt || registration.retentionExpiresAt <= new Date()) return;
    const details = [formatMeetingDate(registration.meeting.startsAt) + ' (თბილისის დროით)',
      registration.meeting.format === 'online' ? 'ონლაინ' : `პირისპირ — ${registration.meeting.location}`].join('\n');
    const admin = process.env.ADMIN_EMAIL;
    if (admin && !registration.adminNotifiedAt) {
      try {
        const emailId = await sendNotificationEmail({ from, to: admin, key: `meeting-${id}-admin`, subject: 'learnTM.ge — ახალი რეგისტრაცია',
          text: `მიღებულია ახალი რეგისტრაცია. დეტალები ხელმისაწვდომია ავტორიზაციის შემდეგ:\n${privateAdminUrl(`registration-${id}`)}` });
        await tx.meetingRegistration.update({ where: { id }, data: { adminNotifiedAt: new Date(), adminEmailId: emailId } });
      } catch { console.error('Meeting administrator notification pending.'); }
    }
    if (!registration.participantNotifiedAt) {
      try {
        const emailId = await sendNotificationEmail({ from, to: registration.email, key: `meeting-${id}-participant`, subject: 'learnTM.ge — რეგისტრაციის დადასტურება',
          text: `გამარჯობა, ${registration.firstName}!\n\nშენი რეგისტრაცია დადასტურებულია.\n\n${details}\n\n${registration.meeting.joiningInstructions || ''}` });
        await tx.meetingRegistration.update({ where: { id }, data: { participantNotifiedAt: new Date(), participantEmailId: emailId } });
      } catch { console.error('Meeting participant notification pending.'); }
    }
  }, { timeout: 30000, maxWait: 10000 });
}
