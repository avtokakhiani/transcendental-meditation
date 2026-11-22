import { createCipheriv, createDecipheriv, randomBytes, randomUUID } from 'node:crypto';
import { execFile } from 'node:child_process';
import { promisify } from 'node:util';
import { mkdir, readFile, readdir, stat, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { prisma } from '@/server/db';
import { privacyStorageDirectory, prunePrivacyFiles } from '@/server/privacy-files';
import { privacyOperationalLog } from '@/server/privacy-log';

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

/** Local Docker SQL only. Production provider backups require separate verified configuration. */
export async function ensureLocalPrivacyBackup(force = false) {
  const url = process.env.DATABASE_URL || '';
  if (!/^sqlserver:\/\/(localhost|127\.0\.0\.1)(:|;)/i.test(url)) throw new Error('Local backup helper refuses remote databases');
  backupKey();
  const directory = path.join(privacyStorageDirectory(), 'backups');
  await mkdir(directory, { recursive: true, mode: 0o700 });
  await prunePrivacyFiles();
  // Remove interrupted local staging files; these are never downloadable by the website.
  for (const file of await readdir(directory)) {
    if (/^learntm-backup-[a-f\d-]{36}\.bak$/i.test(file) && (await stat(path.join(directory, file))).mtimeMs < Date.now() - 3600000) await unlink(path.join(directory, file));
  }
  await execute('docker', ['exec', 'tm-sqlserver', 'find', '/var/opt/mssql', '-maxdepth', '1', '-type', 'f', '-name', 'learntm-backup-*.bak', '-mmin', '+60', '-delete'], { windowsHide: true });
  const backups = (await readdir(directory)).filter(name => /^learntm-backup-[\w-]+\.enc$/.test(name));
  if (!force) {
    for (const name of backups) if ((await stat(path.join(directory, name))).mtimeMs > Date.now() - 86400000) return;
  }
  const rows = await prisma.$queryRaw<{ name: string }[]>`SELECT DB_NAME() AS name`;
  const name = rows[0]?.name;
  if (!name || !/^[\w-]+$/.test(name)) throw new Error('Unsupported database name');
  const token = randomUUID(), containerPath = `/var/opt/mssql/learntm-backup-${token}.bak`;
  const localPath = path.join(directory, `learntm-backup-${token}.bak`);
  try {
    await prisma.$executeRawUnsafe(`BACKUP DATABASE [${name}] TO DISK = N'${containerPath}' WITH COPY_ONLY, INIT, CHECKSUM`);
    await prisma.$executeRawUnsafe(`RESTORE VERIFYONLY FROM DISK = N'${containerPath}' WITH CHECKSUM`);
    await execute('docker', ['cp', `tm-sqlserver:${containerPath}`, localPath], { windowsHide: true });
    await writeFile(path.join(directory, `learntm-backup-${Date.now()}-${token}.enc`), encryptBackup(await readFile(localPath)), { mode: 0o600 });
    await privacyOperationalLog('backup_verified');
  } finally {
    await unlink(localPath).catch(() => {});
    await execute('docker', ['exec', 'tm-sqlserver', 'rm', '-f', '--', containerPath], { windowsHide: true });
  }
}
