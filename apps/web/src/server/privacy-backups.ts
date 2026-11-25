import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { lstat, mkdir, opendir, readFile, readdir, rename, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/server/db';
import { privacyStorageDirectory, prunePrivacyFiles } from '@/server/privacy-files';
import { privacyOperationalLog } from '@/server/privacy-log';
import { PRIVACY_BACKUP_DAYS } from '@/lib/privacy-retention';

const execute = promisify(execFile);
function backupKey() {
  const key = Buffer.from(process.env.PRIVACY_BACKUP_KEY || '', 'base64');
  if (key.length !== 32) throw new Error('A 32-byte private backup key is required');
  return key;
}
export function encryptBackup(data: Buffer) {
  const iv = randomBytes(12), cipher = createCipheriv('aes-256-gcm', backupKey(), iv);
  const encrypted = Buffer.concat([cipher.update(data), cipher.final()]);
  return Buffer.concat([Buffer.from('LTMB1'), iv, cipher.getAuthTag(), encrypted]);
}
export function decryptBackup(data: Buffer) {
  if (data.subarray(0, 5).toString() !== 'LTMB1') throw new Error('Invalid backup');
  const decipher = createDecipheriv('aes-256-gcm', backupKey(), data.subarray(5, 17));
  decipher.setAuthTag(data.subarray(17, 33));
  return Buffer.concat([decipher.update(data.subarray(33)), decipher.final()]);
}

const managedBackup = /^learntm-backup-[\w-]+\.enc$/;
function backupCreatedAt(name: string) {
  const timestamp = name.match(/^learntm-backup-(\d{13})-/)?.[1];
  return timestamp ? Number(timestamp) : null;
}
async function authenticatedBackup(file: string) {
  const details = await lstat(file);
  if (!details.isFile() || details.isSymbolicLink()) throw new Error('Backup must be a regular private file');
  const bytes = decryptBackup(await readFile(file));
  if (!bytes.length) throw new Error('Empty backup');
  return bytes;
}

/** Read-only authentication/age check; does not prune, connect to SQL or run maintenance. */
export async function verifyLocalPrivacyBackups(now = new Date()) {
  const directory = path.join(privacyStorageDirectory(), 'backups');
  const details = await lstat(directory);
  if (!details.isDirectory() || details.isSymbolicLink()) throw new Error('Backup directory must be private regular storage');
  let count = 0, recent = 0;
  for await (const file of await opendir(directory)) {
    if (!managedBackup.test(file.name)) continue;
    await authenticatedBackup(path.join(/* turbopackIgnore: true */ directory, file.name));
    const created = backupCreatedAt(file.name);
    if (created !== null && created > now.getTime()) throw new Error('Backup creation time is in the future');
    if (created !== null && created <= now.getTime() - PRIVACY_BACKUP_DAYS * 86400000) throw new Error('Backup retention exceeded');
    if (created !== null && created > now.getTime() - 86400000) recent++;
    count++;
  }
  if (!count || !recent) throw new Error('A recent authenticated timestamped backup is required');
  return { count, recent };
}

async function hasRecentVerifiedBackup(directory: string) {
  const now = Date.now();
  for await (const file of await opendir(directory)) {
    const created = backupCreatedAt(file.name);
    if (!managedBackup.test(file.name) || created === null || created > now || created <= now - 86400000) continue;
    try { await authenticatedBackup(path.join(/* turbopackIgnore: true */ directory, file.name)); return true; }
    catch { await privacyOperationalLog('backup_integrity_failure'); }
  }
  return false;
}

/** Local Docker SQL only. Production provider backups require separate verified configuration. */
export async function ensureLocalPrivacyBackup(force = false) {
  const url = process.env.DATABASE_URL || '';
  if (!/^sqlserver:\/\/(localhost|127\.0\.0\.1)(:|;)/i.test(url)) throw new Error('Local backup helper refuses remote databases');
  backupKey();
  const directory = path.join(privacyStorageDirectory(), 'backups');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  const details = await lstat(directory);
  if (!details.isDirectory() || details.isSymbolicLink()) throw new Error('Backup directory must be private regular storage');
  await prunePrivacyFiles();
  // Remove interrupted local staging files; these are never downloadable by the website.
  for (const file of await readdir(directory)) {
    if (/^learntm-backup-[a-f\d-]{36}\.bak$/i.test(file) && (await stat(path.join(directory, file))).mtimeMs < Date.now() - 3600000) await unlink(path.join(directory, file));
    if (/^learntm-backup-\d{13}-[a-f\d-]{36}\.enc\.pending$/i.test(file) && (await lstat(path.join(directory, file))).isFile()
      && (backupCreatedAt(file) || Date.now()) < Date.now() - 3600000) await unlink(path.join(directory, file));
  }
  await execute('docker', ['exec', 'tm-sqlserver', 'find', '/var/opt/mssql', '-maxdepth', '1', '-type', 'f', '-name', 'learntm-backup-*.bak', '-mmin', '+60', '-delete'], { windowsHide: true });
  if (!force && await hasRecentVerifiedBackup(directory)) return;
  const rows = await prisma.$queryRaw<{ name: string }[]>`SELECT DB_NAME() AS name`;
  const name = rows[0]?.name;
  if (!name || !/^[\w-]+$/.test(name)) throw new Error('Unsupported database name');
  const token = randomUUID(), containerPath = `/var/opt/mssql/learntm-backup-${token}.bak`;
  const localPath = path.join(directory, `learntm-backup-${token}.bak`);
  const encryptedPath = path.join(directory, `learntm-backup-${Date.now()}-${token}.enc`);
  const pendingPath = `${encryptedPath}.pending`;
  try {
    await prisma.$executeRawUnsafe(`BACKUP DATABASE [${name}] TO DISK = N'${containerPath}' WITH COPY_ONLY, INIT, CHECKSUM`);
    await prisma.$executeRawUnsafe(`RESTORE VERIFYONLY FROM DISK = N'${containerPath}' WITH CHECKSUM`);
    await execute('docker', ['cp', `tm-sqlserver:${containerPath}`, localPath], { windowsHide: true });
    const original = await readFile(localPath);
    await writeFile(pendingPath, encryptBackup(original), { mode: 0o600, flag: 'wx' });
    if (!(await authenticatedBackup(pendingPath)).equals(original)) throw new Error('Backup disk readback failed');
    await rename(pendingPath, encryptedPath);
    await privacyOperationalLog('backup_verified');
  } finally {
    await unlink(pendingPath).catch(() => {});
    await unlink(localPath).catch(() => {});
    await execute('docker', ['exec', 'tm-sqlserver', 'rm', '-f', '--', containerPath], { windowsHide: true });
  }
}
