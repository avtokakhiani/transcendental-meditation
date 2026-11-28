import { lstat, mkdir, open, opendir, readFile, rename, unlink } from 'node:fs/promises';
import { randomUUID } from 'node:crypto';
import path from 'node:path';
import { PRIVACY_BACKUP_DAYS, PRIVACY_LOG_DAYS, type PrivateRecordScope } from '@/lib/privacy-retention';
import { resolvePrivacyStorageDirectory } from './privacy-storage-path';
import { blobAppendErasure, blobPrunePrivacyFiles, blobReadErasureLedger, privacyBlobEnabled } from './privacy-blob';

export function privacyStorageDirectory() {
  return resolvePrivacyStorageDirectory({
    cwd: process.cwd(), production: process.env.NODE_ENV === 'production',
    configured: process.env.PRIVACY_STORAGE_DIR,
  });
}

export interface ErasureEntry { scope: PrivateRecordScope; targetId: string; deletedAt: string; externalEmailIds?: string[] }
export async function appendErasure(entry: ErasureEntry) {
  if (privacyBlobEnabled()) return blobAppendErasure(entry);
  const directory = privacyStorageDirectory();
  const ledger = path.join(directory, 'erasures');
  await mkdir(ledger, { recursive: true, mode: 0o700 });
  const target = path.join(ledger, `${entry.scope}-${entry.targetId}.json`);
  try {
    const file = await open(target, 'wx', 0o600);
    try { await file.writeFile(JSON.stringify(entry)); await file.sync(); }
    finally { await file.close(); }
  }
  catch (error) {
    if ((error as NodeJS.ErrnoException).code !== 'EEXIST') throw error;
    const details = await lstat(target);
    if (!details.isFile() || details.isSymbolicLink()) throw new Error('Erasure journal must be a regular private file');
    const file = await open(target, 'r+');
    let existing: ErasureEntry;
    try {
      existing = JSON.parse(await file.readFile('utf8'));
      if (existing.scope !== entry.scope || existing.targetId !== entry.targetId || !Number.isFinite(Date.parse(existing.deletedAt))) throw new Error('Invalid existing erasure journal');
      if (existing.externalEmailIds !== undefined && (!Array.isArray(existing.externalEmailIds) || existing.externalEmailIds.length > 2 || !existing.externalEmailIds.every(id => typeof id === 'string' && /^[\w-]{1,100}$/.test(id)))) throw new Error('Invalid existing erasure receipts');
      await file.sync();
    } finally { await file.close(); }
    // A prior SQL transaction may have failed after journaling. Preserve receipt
    // IDs acquired before a later retry without resetting the original expiry.
    const ids = [...new Set([...(existing.externalEmailIds || []), ...(entry.externalEmailIds || [])])];
    if (ids.length > 2) throw new Error('Erasure receipt history requires operator review');
    if (ids.length > (existing.externalEmailIds?.length || 0)) {
      const pending = `${target}.${randomUUID()}.pending`;
      try {
        const replacement = await open(pending, 'wx', 0o600);
        try { await replacement.writeFile(JSON.stringify({ ...existing, externalEmailIds: ids })); await replacement.sync(); }
        finally { await replacement.close(); }
        await rename(pending, target);
      } finally { await unlink(pending).catch(error => { if (error.code !== 'ENOENT') throw error; }); }
    }
  }
  // Retry the directory flush even after EEXIST. Windows does not expose this
  // operation through Node; actual mount/failure durability remains a release gate.
  if (process.platform !== 'win32') {
    const directoryHandle = await open(ledger, 'r');
    try { await directoryHandle.sync(); } finally { await directoryHandle.close(); }
  }
}

export async function readErasureLedger(): Promise<ErasureEntry[]> {
  if (privacyBlobEnabled()) return blobReadErasureLedger();
  try {
    const ledger = path.join(privacyStorageDirectory(), 'erasures');
    if (process.env.NODE_ENV === 'production') {
      const details = await lstat(ledger);
      if (!details.isDirectory() || details.isSymbolicLink()) throw new Error('Production erasure ledger requires its provisioned private directory');
    }
    const entries: ErasureEntry[] = [];
    for await (const entryFile of await opendir(ledger)) {
      if (!entryFile.isFile()) continue;
      const name = entryFile.name;
      if (!/^(registration|corporate)-[a-f\d-]{36}\.json$/i.test(name)) continue;
      const entry = JSON.parse(await readFile(path.join(ledger, name), 'utf8'));
      if (!['registration', 'corporate'].includes(entry.scope) || !/^[a-f\d-]{36}$/i.test(entry.targetId) || !Number.isFinite(Date.parse(entry.deletedAt))) throw new Error('Invalid erasure ledger');
      if (entry.externalEmailIds !== undefined && (!Array.isArray(entry.externalEmailIds) || entry.externalEmailIds.length > 2 || !entry.externalEmailIds.every((id: unknown) => typeof id === 'string' && /^[\w-]{1,100}$/.test(id)))) throw new Error('Invalid erasure receipts');
      entries.push(entry);
    }
    return entries;
  } catch (error) { if ((error as NodeJS.ErrnoException).code === 'ENOENT' && process.env.NODE_ENV !== 'production') return []; throw error; }
}

export async function prunePrivacyFiles(now = new Date()) {
  if (privacyBlobEnabled()) return blobPrunePrivacyFiles(now);
  const directory = privacyStorageDirectory();
  await mkdir(directory, { recursive: true, mode: 0o700 });
  for (const [subdirectory, pattern, days] of [
    ['backups', /^learntm-backup-[\w-]+\.enc$/, PRIVACY_BACKUP_DAYS],
    ['logs', /^learntm-[\w-]+\.jsonl$/, PRIVACY_LOG_DAYS],
  ] as const) {
    // Runtime-only mutable storage is explicitly not a deployable asset. The
    // documented tracing opt-out prevents inference of the entire build tree;
    // exclusions and final artifact checks independently enforce the boundary.
    const folder = path.join(/* turbopackIgnore: true */ directory, subdirectory);
    await mkdir(folder, { recursive: true, mode: 0o700 });
    // These are mutable runtime records, not build assets. Stream directory entries;
    // avoid broad readdir/stat tracing and do not follow symlinks into other storage.
    for await (const file of await opendir(folder)) {
      if (!file.isFile()) continue;
      const name = file.name;
      if (!pattern.test(name)) continue;
      const target = path.join(/* turbopackIgnore: true */ folder, name);
      const logDay = subdirectory === 'logs' ? name.match(/^learntm-(\d{4}-\d{2}-\d{2})\.jsonl$/)?.[1] : undefined;
      const backupTime = subdirectory === 'backups' ? name.match(/^learntm-backup-(\d{13})-/)?.[1] : undefined;
      const details = await lstat(target);
      const created = logDay ? Date.parse(`${logDay}T00:00:00Z`) : backupTime ? Number(backupTime) : details.mtimeMs;
      // A copied or appended file must not reset the original retention clock.
      if (details.isFile() && created <= now.getTime() - days * 86400000) await unlink(target);
    }
  }
  // Keep the deletion ledger longer than the entire backup cycle, but at most 90 days.
  const entries = await readErasureLedger();
  // Interrupted receipt-merge staging contains only the same minimal journal
  // fields and must not outlive the journal's 90-day cycle.
  try {
    const ledger = path.join(directory, 'erasures');
    for await (const file of await opendir(ledger)) {
      if (!file.isFile() || !/^(registration|corporate)-[a-f\d-]{36}\.json\.[a-f\d-]{36}\.pending$/i.test(file.name)) continue;
      const target = path.join(/* turbopackIgnore: true */ ledger, file.name);
      const details = await lstat(target);
      if (!details.isFile()) continue;
      let created = details.mtimeMs;
      try {
        const staged = JSON.parse(await readFile(target, 'utf8'));
        if (Number.isFinite(Date.parse(staged.deletedAt))) created = Date.parse(staged.deletedAt);
      } catch { /* Partial interrupted writes expire by their staging time. */ }
      if (created <= now.getTime() - PRIVACY_LOG_DAYS * 86400000) await unlink(target);
    }
  } catch (error) { if ((error as NodeJS.ErrnoException).code !== 'ENOENT') throw error; }
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
