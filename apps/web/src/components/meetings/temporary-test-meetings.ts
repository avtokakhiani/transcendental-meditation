import type { PublicMeeting } from '@/lib/meetings';

// Retained development fixtures, disconnected from the public panel. Never insert
// these into SQL or treat them as stored registrations or confirmed schedules.
export const TEMPORARY_MEETING_PREVIEW_ENABLED = false;

export const temporaryTestMeetings: PublicMeeting[] = [
  {
    id: 'e5261125-0000-4000-8000-000000000001',
    startsAt: '2026-11-25T19:00:00+04:00',
    format: 'online', teacher: 'ავთანდილ კახიანი', location: null,
    availability: 'open', remaining: null, temporaryTest: true,
  },
  {
    id: 'e5261127-0000-4000-8000-000000000002',
    startsAt: '2026-11-27T18:30:00+04:00',
    format: 'in_person', teacher: 'ლარისა პარკაძე', location: 'თბილისი, ვერა',
    availability: 'open', remaining: null, temporaryTest: true,
  },
  {
    id: 'e5261130-0000-4000-8000-000000000003',
    startsAt: '2026-11-30T20:00:00+04:00',
    format: 'online', teacher: 'ლარისა პარკაძე', location: null,
    availability: 'open', remaining: null, temporaryTest: true,
  },
  {
    id: 'e5261202-0000-4000-8000-000000000004',
    startsAt: '2026-12-02T19:00:00+04:00',
    format: 'in_person', teacher: 'ავთანდილ კახიანი', location: 'თბილისი, ვერა',
    availability: 'open', remaining: null, temporaryTest: true,
  },
];
