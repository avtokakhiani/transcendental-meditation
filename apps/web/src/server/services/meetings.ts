import { Prisma, type PrismaClient } from '@prisma/client';
import type { PublicMeeting, RegistrationInput } from '@/lib/meetings';
import { twelveMonthsAfter } from '@/lib/privacy-retention';

export class MeetingUnavailable extends Error {}

export async function listMeetings(db: PrismaClient): Promise<PublicMeeting[]> {
  const now = new Date();
  const meetings = await db.introductoryMeeting.findMany({
    where: { startsAt: { gt: now }, status: { in: ['open', 'closed'] } },
    orderBy: [{ startsAt: 'asc' }, { id: 'asc' }],
    select: { id: true, startsAt: true, format: true, location: true, status: true, capacity: true,
      registrationClosesAt: true, _count: { select: { registrations: true } } },
  });
  return meetings.map(meeting => {
    const remaining = meeting.capacity === null ? null : Math.max(0, meeting.capacity - meeting._count.registrations);
    return {
      id: meeting.id, startsAt: meeting.startsAt.toISOString(),
      format: meeting.format as PublicMeeting['format'], location: meeting.format === 'in_person' ? meeting.location : null,
      remaining, availability: meeting.status === 'closed' || (meeting.registrationClosesAt && meeting.registrationClosesAt <= now)
        ? 'closed' : remaining === 0 ? 'full' : 'open',
    };
  });
}

export async function registerForMeeting(db: PrismaClient, input: RegistrationInput) {
  // Serialize registrations on the meeting row across every process. No email or
  // network calls inside this transaction. The unique key is a second duplicate guard.
  for (let attempt = 0; ; attempt++) {
    try {
      return await db.$transaction(async tx => {
        await tx.$queryRaw`SELECT [id] FROM [dbo].[introductory_meetings] WITH (UPDLOCK, HOLDLOCK) WHERE [id] = ${input.meetingId}`;
        const meeting = await tx.introductoryMeeting.findUnique({ where: { id: input.meetingId } });
        if (!meeting || meeting.status === 'draft') throw new MeetingUnavailable();
        const existing = await tx.meetingRegistration.findUnique({
          where: { meetingId_email: { meetingId: input.meetingId, email: input.email } },
        });
        // Identical retries are successful without adding seats or revealing personal data.
        if (existing) return existing.id;
        const now = new Date();
        if (meeting.status !== 'open' || meeting.startsAt <= now || (meeting.registrationClosesAt && meeting.registrationClosesAt <= now)) {
          throw new MeetingUnavailable();
        }
        const count = await tx.meetingRegistration.count({ where: { meetingId: meeting.id } });
        if (meeting.capacity !== null && count >= meeting.capacity) throw new MeetingUnavailable();
        const registration = await tx.meetingRegistration.create({ data: {
          meetingId: meeting.id, firstName: input.firstName, lastName: input.lastName,
          email: input.email, phone: input.phone, retentionExpiresAt: twelveMonthsAfter(meeting.startsAt),
        }, select: { id: true } });
        return registration.id;
      }, { isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted, maxWait: 10000, timeout: 15000 });
    } catch (error) {
      if (attempt < 2 && error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2034') continue;
      throw error;
    }
  }
}
