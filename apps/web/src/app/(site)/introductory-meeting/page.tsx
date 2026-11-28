import type { Metadata } from 'next';
import { MeetingRegistration } from '@/components/meetings/meeting-registration';

export const metadata: Metadata = { title: 'გაცნობითი შეხვედრა' };

export default function IntroductoryMeetingPage() {
  return (
    <section aria-labelledby="meeting-heading" className="mx-auto max-w-4xl px-5 py-20 sm:px-6 sm:py-28 lg:px-10">
      <MeetingRegistration titleId="meeting-heading" standalone />
    </section>
  );
}
