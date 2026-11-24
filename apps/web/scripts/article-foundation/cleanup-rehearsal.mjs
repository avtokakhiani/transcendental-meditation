import assert from 'node:assert/strict';
import console from 'node:console';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { artifacts, database, db, hash, json, readProtected } from './local.mjs';

try {
  const backup = JSON.parse(await readFile(path.join(artifacts, 'backup.json'), 'utf8'));
  assert.equal(hash(await readProtected(backup.hostFile)), backup.sha256, 'Keep a verified encrypted backup before cleaning up the disposable restore');
  const passed = JSON.parse(await readFile(path.join(artifacts, 'rehearsal-passed.json'), 'utf8'));
  assert.equal(passed.constraintsVerified, true);
  assert.match(backup.restoredDatabase, /^article_foundation_restore_\d+$/);
  assert.notEqual(backup.restoredDatabase, database);
  await db.$executeRawUnsafe(`IF DB_ID(N'${backup.restoredDatabase}') IS NOT NULL BEGIN ALTER DATABASE [${backup.restoredDatabase}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [${backup.restoredDatabase}]; END`);
  await json(path.join(artifacts, 'rehearsal-cleanup.json'), { removedOnly: backup.restoredDatabase, at: new Date().toISOString(), encryptedBackupRetained: true });
  console.log('Disposable rehearsal database removed; website database and verified encrypted backup retained.');
} finally { await db.$disconnect(); }
