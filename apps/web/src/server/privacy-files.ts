import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { PRIVACY_BACKUP_DAYS, PRIVACY_LOG_DAYS, type PrivateRecordScope } from '@/lib/privacy-retention';

export function privacyStorageDirectory() {
  const directory = path.resolve(process.env.PRIVACY_STORAGE_DIR || path.join(process.cwd(), 'private'));
  const relative = path.relative(path.resolve(process.cwd(), 'public'), directory);
  if (!relative.startsWith('..') && !path.isAbsolute(relative)) throw new Error('Privacy storage cannot be publicly served');
  return directory;
}

export interface ErasureEntry { scope: PrivateRecordScope; targetId: string; deletedAt: string }
export async function appendErasure(entry: ErasureEntry) {
  const directory = privacyStorageDirectory();
  const ledger = path.join(directory, 'erasures');
  await mkdir(ledger, { recursive: true, mode: 0o700 });
  try { await writeFile(path.join(ledger, `${entry.scope}-${entry.targetId}.json`), JSON.stringify(entry), { mode: 0o600, flag: 'wx' }); }
  catch (error) { if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error; }
}

export async function readErasureLedger(): Promise<ErasureEntry[]> {
  try {
    const ledger = path.join(privacyStorageDirectory(), 'erasures');
    const entries: ErasureEntry[] = [];
    for (const name of await readdir(ledger)) {
      if (!/^(registration|corporate)-[a-f\d-]{36}\.json$/i.test(name)) continue;
      const entry = JSON.parse(await readFile(path.join(ledger, name), 'utf8'));
      if (!['registration', 'corporate'].includes(entry.scope) || !/^[a-f\d-]{36}$/i.test(entry.targetId) || !Number.isFinite(Date.parse(entry.deletedAt))) throw new Error('Invalid erasure ledger');
      entries.push(entry);
    }
    return entries;
  } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT') return []; throw error; }
}

export async function prunePrivacyFiles(now = new Date()) {
  const directory = privacyStorageDirectory();
  await mkdir(directory, { recursive: true, mode: 0o700 });
  for (const [subdirectory, pattern, days] of [
    ['backups', /^learntm-backup-[\w-]+\.enc$/, PRIVACY_BACKUP_DAYS],
    ['logs', /^learntm-[\w-]+\.jsonl$/, PRIVACY_LOG_DAYS],
  ] as const) {
    const folder = path.join(directory, subdirectory);
    await mkdir(folder, { recursive: true, mode: 0o700 });
    for (const name of await readdir(folder)) {
      if (!pattern.test(name)) continue;
      const target = path.join(folder, name), details = await stat(target);
      const logDay = subdirectory === 'logs' ? name.match(/^learntm-(\d{4}-\d{2}-\d{2})\.jsonl$/)?.[1] : undefined;
      const backupTime = subdirectory === 'backups' ? name.match(/^learntm-backup-(\d{13})-/)?.[1] : undefined;
      const created = logDay ? Date.parse(`${logDay}T00:00:00Z`) : backupTime ? Number(backupTime) : details.mtimeMs;
      // A copied or appended file must not reset the original retention clock.
      if (details.isFile() && created <= now.getTime() - days * 86400000) await unlink(target);
    }
  }
  // Keep the deletion ledger longer than the entire backup cycle, but at most 90 days.
  const entries = await readErasureLedger();
  for (const entry of entries) {
    if (Date.parse(entry.deletedAt) <= now.getTime() - PRIVACY_LOG_DAYS * 86400000) {
      await unlink(path.join(directory, 'erasures', `${entry.scope}-${entry.targetId}.json`)).catch(error => { if (error.code !== 'ENOENT') throw error; });
    }
  }
  return { activeErasureEntries: entries.length };
}

export async function compactErasureLedger(now = new Date()) {
  await prunePrivacyFiles(now);
}
