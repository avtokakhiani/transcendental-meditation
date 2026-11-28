import type { PrismaClient } from '@prisma/client';
import { prisma } from '@/server/db';
import { privateAdminUrl, sendNotificationEmail } from '@/server/notification-email';

export async function notifyCorporateInquiry(id: string, db: PrismaClient = prisma) {
  const from = process.env.CORPORATE_FROM_EMAIL, to = process.env.ADMIN_EMAIL;
  if (!process.env.RESEND_API_KEY || !from || !to) return;
  await db.$transaction(async tx => {
    await tx.$queryRaw`SELECT [id] FROM [dbo].[corporate_inquiries] WITH (UPDLOCK, HOLDLOCK) WHERE [id] = ${id}`;
    const inquiry = await tx.corporateInquiry.findUnique({ where: { id } });
    if (!inquiry || inquiry.adminNotifiedAt || inquiry.processingRestrictedAt || inquiry.retentionExpiresAt <= new Date()) return;
    const emailId = await sendNotificationEmail({ from, to, key: `corporate-${id}`, subject: 'learnTM.ge — ახალი მოთხოვნა',
      text: `მიღებულია ახალი მოთხოვნა. დეტალები ხელმისაწვდომია მხოლოდ ავტორიზაციის შემდეგ:\n${privateAdminUrl(`corporate-${id}`)}` });
    await tx.corporateInquiry.update({ where: { id }, data: { adminNotifiedAt: new Date(), adminEmailId: emailId } });
  }, { timeout: 20000, maxWait: 10000 });
}
