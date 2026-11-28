'use server';

import { z } from 'zod';
import { revalidatePath } from 'next/cache';
import { requirePrivacyAdministrator } from '@/server/auth';
import { twelveMonthsAfter } from '@/lib/privacy-retention';
import { prisma } from '@/server/db';
import { notifyMeetingRegistration } from '@/server/meeting-notifications';

export type MeetingFormState = { error?: string; success?: string };
const inputSchema = z.object({
  id: z.union([z.uuid(), z.literal('')]),
  startsAt: z.iso.datetime({ offset: true }),
  registrationClosesAt: z.union([z.iso.datetime({ offset: true }), z.literal('')]),
  format: z.enum(['online', 'in_person']),
  location: z.string().trim().max(500),
  joiningInstructions: z.string().trim().max(2000),
  status: z.enum(['draft', 'open', 'closed']),
  capacity: z.number().int().positive().max(1000000).nullable(),
}).refine(value => value.format !== 'in_person' || value.location.length > 0, { message: 'პირისპირ შეხვედრისთვის მიუთითე მდებარეობა.' });

function tbilisiInstant(value: FormDataEntryValue | null) {
  if (typeof value !== 'string' || !value) return '';
  return `${value.length === 16 ? `${value}:00` : value}+04:00`;
}

export async function saveMeeting(_previous: MeetingFormState, data: FormData): Promise<MeetingFormState> {
  await requirePrivacyAdministrator();
  const parsed = inputSchema.safeParse({ ...Object.fromEntries(data),
    startsAt: tbilisiInstant(data.get('startsAt')),
    registrationClosesAt: tbilisiInstant(data.get('registrationClosesAt')),
    capacity: data.get('capacity') ? Number(data.get('capacity')) : null,
  });
  if (!parsed.success) return { error: 'შეამოწმე ველები. პირისპირ შეხვედრისთვის მდებარეობა აუცილებელია.' };
  const value = parsed.data;
  const startsAt = new Date(value.startsAt);
  const registrationClosesAt = value.registrationClosesAt ? new Date(value.registrationClosesAt) : null;
  if (value.status === 'open' && startsAt <= new Date()) return { error: 'ღია შეხვედრის თარიღი მომავალში უნდა იყოს.' };
  if (registrationClosesAt && registrationClosesAt > startsAt) return { error: 'რეგისტრაციის დასრულება შეხვედრის დაწყებამდე უნდა იყოს.' };
  try {
    await prisma.$transaction(async tx => {
      if (value.id) {
        await tx.$queryRaw`SELECT [id] FROM [dbo].[introductory_meetings] WITH (UPDLOCK, HOLDLOCK) WHERE [id] = ${value.id}`;
        const count = await tx.meetingRegistration.count({ where: { meetingId: value.id } });
        if (value.capacity !== null && value.capacity < count) throw new Error('capacity');
      }
      const record = { startsAt, registrationClosesAt, format: value.format, location: value.location || null,
        joiningInstructions: value.joiningInstructions || null, status: value.status, capacity: value.capacity };
      if (value.id) {
        await tx.introductoryMeeting.update({ where: { id: value.id }, data: record });
        await tx.meetingRegistration.updateMany({ where: { meetingId: value.id }, data: { retentionExpiresAt: twelveMonthsAfter(startsAt) } });
      }
      else await tx.introductoryMeeting.create({ data: record });
    });
  } catch { return { error: 'შენახვა ვერ მოხერხდა. ადგილების რაოდენობა უკვე რეგისტრირებულთა რაოდენობაზე ნაკლები არ უნდა იყოს.' }; }
  revalidatePath('/admin/meetings');
  return { success: 'შეხვედრა შენახულია.' };
}

export async function retryMeetingNotifications(data: FormData) {
  await requirePrivacyAdministrator();
  const id = z.uuid().parse(data.get('meetingId'));
  const pending = await prisma.meetingRegistration.findMany({
    where: { meetingId: id, OR: [{ adminNotifiedAt: null }, { participantNotifiedAt: null }] }, select: { id: true },
  });
  for (const registration of pending) await notifyMeetingRegistration(registration.id);
  revalidatePath('/admin/meetings');
}
