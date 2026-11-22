import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { privacyStorageDirectory } from '@/server/privacy-files';

/** Deliberately accepts no free-text message, user data, URL, IP, or exception object. */
export async function privacyOperationalLog(event: 'maintenance_success' | 'maintenance_failure' | 'backup_verified', counts?: { registrations: number; corporate: number }) {
  const now = new Date(), directory = path.join(privacyStorageDirectory(), 'logs');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await appendFile(path.join(directory, `learntm-${now.toISOString().slice(0, 10)}.jsonl`), `${JSON.stringify({ createdAt: now.toISOString(), event, ...(counts ? { registrations: counts.registrations, corporate: counts.corporate } : {}) })}\n`, { mode: 0o600 });
}
