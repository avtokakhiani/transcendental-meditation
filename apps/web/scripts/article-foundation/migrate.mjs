import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import console from 'node:console';
import process from 'node:process';
import { readFile, writeFile, unlink } from 'node:fs/promises';
import path from 'node:path';
import { artifacts, connection, database, db, hash, readProtected, web } from './local.mjs';

try {
  const mode = process.argv[2];
  assert.ok(['rehearsal', 'local'].includes(mode));
  const backup = JSON.parse(await readFile(path.join(artifacts, 'backup.json'), 'utf8'));
  assert.equal(backup.database, database);
  assert.equal(hash(await readProtected(backup.hostFile)), backup.sha256, 'Decrypted backup checksum must still match');
  if (mode === 'local') {
    const baseline = JSON.parse(await readFile(path.join(artifacts, 'before/report.json'), 'utf8'));
    assert.deepEqual(baseline.errors, []);
    await readFile(path.join(artifacts, 'rehearsal-passed.json'));
  }
  const url = mode === 'rehearsal' ? connection.replace(`database=${database}`, `database=${backup.restoredDatabase}`) : connection;
  if (process.argv.includes('--reset-rehearsal')) {
    assert.equal(mode, 'rehearsal', 'Restore only the isolated rehearsal database');
    assert.match(backup.restoredDatabase, /^article_foundation_restore_\d+$/);
    assert.match(backup.backupFile, /^\/var\/opt\/mssql\/data\/article_foundation_\d+\.bak$/);
    const stagingFile = path.join(artifacts, 'restore-staging.bak');
    await writeFile(stagingFile, await readProtected(backup.hostFile), { mode: 0o600, flag: 'wx' });
    try {
    const copy = spawnSync('docker', ['cp', stagingFile, `tm-sqlserver:${backup.backupFile}`], { encoding: 'utf8', windowsHide: true });
    assert.equal(copy.status, 0, copy.stderr);
    const physicalFiles = await db.$queryRaw`SELECT name, type FROM sys.database_files ORDER BY file_id`;
    const moves = physicalFiles.map((file, index) => {
      assert.match(file.name, /^[a-zA-Z0-9_-]+$/);
      return `MOVE N'${file.name}' TO N'/var/opt/mssql/data/${backup.restoredDatabase}_${index}.${file.type === 1 ? 'ldf' : 'mdf'}'`;
    });
    const query = `IF DB_ID(N'${backup.restoredDatabase}') IS NOT NULL ALTER DATABASE [${backup.restoredDatabase}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; RESTORE DATABASE [${backup.restoredDatabase}] FROM DISK=N'${backup.backupFile}' WITH REPLACE, ${moves.join(', ')}, CHECKSUM; ALTER DATABASE [${backup.restoredDatabase}] SET MULTI_USER;`;
    const restore = spawnSync('docker', ['exec', 'tm-sqlserver', '/bin/bash', '-c', 'exec /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -b -Q "$1"', '--', query], { encoding: 'utf8', windowsHide: true });
    assert.equal(restore.status, 0, restore.stderr);
    } finally {
      await unlink(stagingFile);
      const remove = spawnSync('docker', ['exec', 'tm-sqlserver', 'rm', '-f', '--', backup.backupFile], { encoding: 'utf8', windowsHide: true });
      assert.equal(remove.status, 0, remove.stderr);
    }
  }
  if (process.argv.includes('--resolve-rehearsal')) {
    assert.equal(mode, 'rehearsal', 'Failed migration resolution is allowed only on the isolated restore');
    const resolved = spawnSync(process.execPath, [path.join(web, 'node_modules/prisma/build/index.js'), 'migrate', 'resolve', '--rolled-back', '20261124000000_article_foundation'], { cwd: web, env: { ...process.env, DATABASE_URL: url }, encoding: 'utf8', windowsHide: true });
    assert.equal(resolved.status, 0, resolved.stderr);
  }
  const result = spawnSync(process.execPath, [path.join(web, 'node_modules/prisma/build/index.js'), 'migrate', 'deploy'], { cwd: web, env: { ...process.env, DATABASE_URL: url }, encoding: 'utf8', windowsHide: true });
  // Prisma reports the local host/database but not the connection password.
  console.log(result.stdout);
  if (result.status !== 0) console.error(result.stderr);
  assert.equal(result.status, 0, 'Migration failed');
} finally { await db.$disconnect(); }
