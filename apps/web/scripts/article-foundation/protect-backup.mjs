import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import console from 'node:console';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { artifacts, db, decrypt, encrypt, hash, json, readProtected } from './local.mjs';

try {
  const manifest = path.join(artifacts, 'backup.json');
  const backup = JSON.parse(await readFile(manifest, 'utf8'));
  const original = await readProtected(backup.hostFile);
  assert.equal(hash(original), backup.sha256);
  if (!backup.hostFile.endsWith('.enc')) {
    const file = `${backup.hostFile}.enc`;
    await writeFile(file, encrypt(original), { mode: 0o600, flag: 'wx' });
    assert.deepEqual(decrypt(await readFile(file)), original, 'Encryption must round-trip the verified native backup');
    const oldFile = backup.hostFile;
    backup.hostFile = file;
    backup.encryption = 'AES-256-GCM, LTMB1, existing PRIVACY_BACKUP_KEY';
    backup.encryptedSha256 = hash(await readFile(file));
    backup.reviewOrRemoveBy = new Date(Date.parse(backup.createdAt) + 30 * 86400000).toISOString();
    await json(manifest, backup);
    assert.equal(path.dirname(oldFile), artifacts);
    await unlink(oldFile);
  }
  const snapshot = path.join(artifacts, 'database-before.json');
  try {
    const records = await readFile(snapshot);
    await writeFile(`${snapshot}.enc`, encrypt(records), { mode: 0o600, flag: 'wx' });
    assert.deepEqual(decrypt(await readFile(`${snapshot}.enc`)), records);
    await unlink(snapshot);
  } catch (error) { if (error.code !== 'ENOENT') throw error; }
  assert.match(backup.backupFile, /^\/var\/opt\/mssql\/data\/article_foundation_\d+\.bak$/);
  const remove = spawnSync('docker', ['exec', 'tm-sqlserver', 'rm', '-f', '--', backup.backupFile], { encoding: 'utf8', windowsHide: true });
  assert.equal(remove.status, 0, remove.stderr);
  console.log('Verified backup and original-record inventory encrypted using the existing local backup key; plaintext staging copies removed.');
} finally { await db.$disconnect(); }
