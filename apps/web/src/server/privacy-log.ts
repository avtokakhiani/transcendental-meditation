import { appendFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { privacyStorageDirectory } from '@/server/privacy-files';
import { blobPrivacyLog, privacyBlobEnabled } from '@/server/privacy-blob';

/** Deliberately accepts no free-text message, user data, URL, IP, or exception object. */
export async function privacyOperationalLog(event: 'maintenance_success' | 'maintenance_failure' | 'backup_verified' | 'backup_integrity_failure', counts?: { registrations: number; corporate: number }) {
  const now = new Date();
  const record = { createdAt: now.toISOString(), event, ...(counts ? { registrations: counts.registrations, corporate: counts.corporate } : {}) };
  if (privacyBlobEnabled()) return blobPrivacyLog(record, now);
  const directory = path.join(privacyStorageDirectory(), 'logs');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await appendFile(path.join(directory, `learntm-${now.toISOString().slice(0, 10)}.jsonl`), `${JSON.stringify(record)}\n`, { mode: 0o600 });
}
