import { createHmac } from 'node:crypto';
import type { PrismaClient } from '@prisma/client';
import type { z } from 'zod';
import type { corporateInquirySchema } from '@/lib/corporate-inquiry';
import { twelveMonthsAfter } from '@/lib/privacy-retention';

export async function storeCorporateInquiry(db: PrismaClient, input: z.infer<typeof corporateInquirySchema>, secret: string, now = new Date()) {
  const content = { name: input.name, organization: input.organization, email: input.email.toLowerCase(), phone: input.phone, contactMethod: input.contactMethod, message: input.message };
  const deduplicationKey = createHmac('sha256', secret).update(`${Math.floor(now.getTime() / 600000)}:${JSON.stringify(content)}`).digest('hex');
  return db.corporateInquiry.upsert({
    where: { deduplicationKey }, update: {},
    create: { ...content, deduplicationKey, lastBusinessContactAt: now, retentionExpiresAt: twelveMonthsAfter(now) }, select: { id: true },
  });
}
