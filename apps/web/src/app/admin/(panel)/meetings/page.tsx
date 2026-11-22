import { formatMeetingDate } from '@/lib/meetings';
import { requirePrivacyAdministrator } from '@/server/auth';
import { prisma } from '@/server/db';
import { retryMeetingNotifications } from './actions';
import { MeetingEditor } from './meeting-editor';

function localInput(value: Date | null) {
  // Asia/Tbilisi is UTC+04:00, with no daylight-saving transitions for scheduled meetings.
  return value ? new Date(value.getTime() + 4 * 3600000).toISOString().slice(0, 16) : '';
}

export default async function MeetingsAdminPage() {
  await requirePrivacyAdministrator();
  const meetings = await prisma.introductoryMeeting.findMany({ orderBy: { startsAt: 'desc' }, include: { registrations: { orderBy: { createdAt: 'asc' } } } });
  const emailConfigured = Boolean(process.env.RESEND_API_KEY && (process.env.MEETINGS_FROM_EMAIL || process.env.CORPORATE_FROM_EMAIL) && process.env.ADMIN_EMAIL);
  return <div className="mx-auto max-w-4xl space-y-8">
    <h1 className="text-2xl text-plum-800">გაცნობითი შეხვედრები</h1>
    {!emailConfigured && <p role="status" className="rounded-xl bg-cream-200 p-4 text-sm leading-7">ელფოსტის გაგზავნა სრულად არ არის გამართული. რეგისტრაციები უსაფრთხოდ ინახება; წერილების გაგზავნა მოგვიანებით შეგიძლია გაიმეორო.</p>}
    <section className="rounded-2xl border border-cream-300 bg-cream-50 p-6">
      <h2 className="mb-6 text-xl">ახალი შეხვედრა</h2>
      <MeetingEditor />
    </section>
    {meetings.map(meeting => <section key={meeting.id} className="rounded-2xl border border-cream-300 bg-cream-50 p-6">
      <h2 className="mb-4 text-lg">{formatMeetingDate(meeting.startsAt)}</h2>
      <p className="mb-4 text-sm">რეგისტრაციები: {meeting.registrations.length}</p>
      <details><summary className="mb-5 cursor-pointer">შეხვედრის რედაქტირება</summary><MeetingEditor meeting={{
        id: meeting.id, startsAt: localInput(meeting.startsAt), registrationClosesAt: localInput(meeting.registrationClosesAt),
        format: meeting.format, location: meeting.location, joiningInstructions: meeting.joiningInstructions,
        status: meeting.status, capacity: meeting.capacity,
      }} /></details>
      <details className="mt-5"><summary className="cursor-pointer">მონაწილეები (კონფიდენციალური)</summary>
        <ul className="mt-4 space-y-4">{meeting.registrations.map(registration => <li key={registration.id} className="rounded-lg bg-cream-100 p-4 text-sm leading-7 break-words">
          <p>{registration.firstName} {registration.lastName}</p><p>{registration.email}</p><p>{registration.phone}</p>
          <p>ადმინისტრატორის შეტყობინება: {registration.adminNotifiedAt ? 'გაგზავნილია' : 'გასაგზავნია'}</p>
          <p>მონაწილის დასტური: {registration.participantNotifiedAt ? 'გაგზავნილია' : 'გასაგზავნია'}</p>
        </li>)}</ul>
        {meeting.registrations.length > 0 && <form action={retryMeetingNotifications} className="mt-4"><input type="hidden" name="meetingId" value={meeting.id} /><button className="rounded-full bg-mist-300 px-5 py-3">გაუგზავნელი წერილების გაგზავნა</button></form>}
      </details>
    </section>)}
  </div>;
}
