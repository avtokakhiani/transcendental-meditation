import { z } from 'zod';

export const registrationSchema = z.object({
  meetingId: z.uuid(),
  firstName: z.string().trim().min(1, 'შეიყვანე სახელი.').max(100),
  lastName: z.string().trim().min(1, 'შეიყვანე გვარი.').max(100),
  email: z.email('შეიყვანე სწორი ელფოსტა.').max(254).transform(value => value.toLowerCase()),
  phone: z.string().trim().min(5).max(40).regex(/^\+?[\d\s().-]+$/, 'შეიყვანე სწორი ტელეფონის ნომერი.')
    .refine(value => value.replace(/\D/g, '').length >= 7 && value.replace(/\D/g, '').length <= 15, 'შეიყვანე სწორი ტელეფონის ნომერი.'),
  website: z.string().max(0).optional(),
});

export type RegistrationInput = z.infer<typeof registrationSchema>;
export interface PublicMeeting {
  id: string;
  teacher?: string;
  temporaryTest?: boolean;
  startsAt: string;
  format: 'online' | 'in_person';
  location: string | null;
  availability: 'open' | 'full' | 'closed';
  remaining: number | null;
}

export function formatMeetingDate(value: string | Date) {
  return new Intl.DateTimeFormat('ka-GE', {
    timeZone: 'Asia/Tbilisi', year: 'numeric', month: 'long', day: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).format(new Date(value));
}

export const registrationError = 'რეგისტრაცია ვერ მოხერხდა. გთხოვ, სცადო ხელახლა.';

const georgianMonths = ['იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი', 'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი'];

export function formatCompactMeetingDate(value: string | Date) {
  // Explicit month names also work in browsers without Georgian locale data.
  const parts = Object.fromEntries(new Intl.DateTimeFormat('en-GB', {
    timeZone: 'Asia/Tbilisi', day: 'numeric', month: 'numeric',
    hour: '2-digit', minute: '2-digit', hourCycle: 'h23',
  }).formatToParts(new Date(value)).map(part => [part.type, part.value]));
  return `${Number(parts.day)} ${georgianMonths[Number(parts.month) - 1]} • ${parts.hour}:${parts.minute}`;
}
