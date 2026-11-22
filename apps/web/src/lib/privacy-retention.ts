export const PRIVACY_LOG_DAYS = 90;
export const PRIVACY_BACKUP_DAYS = 30;
export type PrivateRecordScope = 'registration' | 'corporate';

/** Calendar months in Tbilisi, clamping leap days and month ends. */
export function twelveMonthsAfter(value: Date) {
  const local = new Date(value.getTime() + 4 * 3600000);
  const year = local.getUTCFullYear() + 1, month = local.getUTCMonth();
  const day = Math.min(local.getUTCDate(), new Date(Date.UTC(year, month + 1, 0)).getUTCDate());
  return new Date(Date.UTC(year, month, day, local.getUTCHours(), local.getUTCMinutes(), local.getUTCSeconds(), local.getUTCMilliseconds()) - 4 * 3600000);
}

export function productionPrivacyBlocked() {
  return process.env.NODE_ENV === 'production' && privacyLaunchBlockers().length > 0;
}

export function privacyLaunchBlockers() {
  const blockers: string[] = [];
  for (const key of ['PRIVACY_LAUNCH_APPROVED', 'PRIVACY_BACKUPS_VERIFIED', 'PRIVACY_LOG_RETENTION_VERIFIED', 'PRIVACY_PROCESSORS_VERIFIED', 'PRIVACY_EXTERNAL_DELETION_VERIFIED', 'PRIVACY_RIGHTS_PROCESS_VERIFIED']) {
    if (process.env[key] !== 'true') blockers.push(key);
  }
  for (const key of ['RESEND_API_KEY', 'MEETINGS_FROM_EMAIL', 'CORPORATE_FROM_EMAIL', 'ADMIN_EMAIL']) if (!process.env[key]) blockers.push(key);
  try { if (!process.env.SITE_URL || new URL(process.env.SITE_URL).protocol !== 'https:') blockers.push('SITE_URL_HTTPS'); } catch { blockers.push('SITE_URL_HTTPS'); }
  return blockers;
}
