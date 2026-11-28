import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import { PrismaClient } from '@prisma/client';
import { artifacts, connection, database, db, hash, json, readProtected, snapshot } from './local.mjs';

let testDb;
try {
  assert.equal(path.basename(artifacts), 'phase3-2026-11-24');
  const backup = JSON.parse(await readFile(path.join(artifacts, 'backup.json'), 'utf8'));
  const original = JSON.parse((await readProtected(path.join(artifacts, 'database-before.json'))).toString());
  const current = await snapshot();
  assert.equal(hash(JSON.stringify(current)), hash(JSON.stringify(original)), 'Working database must exactly match the pre-Phase-3 record inventory');
  assert.match(backup.restoredDatabase, /^article_foundation_restore_\d+$/);
  testDb = new PrismaClient({ datasourceUrl: connection.replace(/database=[^;]+/, `database=${backup.restoredDatabase}`), log: [] });
  const restored = await snapshot(testDb);
  assert.equal(hash(JSON.stringify(restored)), hash(JSON.stringify(original)), 'All isolated fixtures must be removed; original books/posts/revisions restored exactly');
  await json(path.join(artifacts, 'phase3-records.json'), { at: new Date().toISOString(), workingRecordsUnchanged: true, isolatedFixturesRemoved: true, tables: Object.keys(original), counts: Object.fromEntries(Object.entries(current).map(([table, rows]) => [table, rows.length])) });
  if (process.argv.includes('--cleanup')) {
    const ui = JSON.parse(await readFile(path.join(artifacts, 'admin/report.json'), 'utf8'));
    assert.equal(ui.passed, true); assert.notEqual(backup.restoredDatabase, database);
    await testDb.$disconnect();
    await db.$executeRawUnsafe(`ALTER DATABASE [${backup.restoredDatabase}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [${backup.restoredDatabase}];`);
    await json(path.join(artifacts, 'phase3-cleanup.json'), { removedOnly: backup.restoredDatabase, encryptedBackupRetained: true, at: new Date().toISOString() });
  }
  console.log('Every working database record matches the pre-Phase-3 inventory. Isolated article/media fixtures removed and original book records restored exactly.');
} finally { await testDb?.$disconnect(); await db.$disconnect(); }
