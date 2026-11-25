/**
 * Owner-approved initial-launch fallback. Re-enabling requires a reviewed code
 * change after the integration/operations checklist; environment flags alone
 * must never activate public registration. Administration remains available.
 */
export function publicMeetingRegistrationEnabled(): boolean {
  return false;
}

export const noUpcomingMeetingsNotice = 'ამჟამად გაცნობითი შეხვედრები დაგეგმილი არ არის. გთხოვ, მოგვიანებით შემოგვიერთდე.';
