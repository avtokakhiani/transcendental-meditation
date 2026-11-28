import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';
import { mkdir, readFile } from 'node:fs/promises';
import path from 'node:path';
import console from 'node:console';
import process from 'node:process';
import { PrismaClient } from '@prisma/client';
import { artifacts, connection, database, db, hash, json, snapshot, web } from './local.mjs';

function docker(...args) {
  const result = spawnSync('docker', args, { encoding: 'utf8', windowsHide: true });
  assert.equal(result.status, 0, `Docker backup operation failed: ${result.stderr}`);
  return result.stdout;
}
function sql(query) {
  // Resolve the password inside the container; never put it in command arguments or logs.
  return docker('exec', 'tm-sqlserver', '/bin/bash', '-c', 'exec /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -b -Q "$1"', '--', query);
}

try {
  await mkdir(artifacts, { recursive: true });
  const manifestPath = path.join(artifacts, 'backup.json');
  await assert.rejects(readFile(manifestPath), { code: 'ENOENT' }, 'Choose a new FOUNDATION_RUN; never overwrite a backup');
  const before = await snapshot();
  const stamp = Date.now().toString();
  const restoredDatabase = `article_foundation_restore_${stamp}`;
  const backupFile = `/var/opt/mssql/data/article_foundation_${stamp}.bak`;
  const physicalFiles = await db.$queryRaw`SELECT name, type FROM sys.database_files ORDER BY file_id`;
  const moves = physicalFiles.map((file, index) => {
    assert.match(file.name, /^[a-zA-Z0-9_-]+$/);
    return `MOVE N'${file.name}' TO N'/var/opt/mssql/data/${restoredDatabase}_${index}.${file.type === 1 ? 'ldf' : 'mdf'}'`;
  });
  sql(`BACKUP DATABASE [${database}] TO DISK=N'${backupFile}' WITH COPY_ONLY, CHECKSUM, INIT; RESTORE VERIFYONLY FROM DISK=N'${backupFile}' WITH CHECKSUM; RESTORE DATABASE [${restoredDatabase}] FROM DISK=N'${backupFile}' WITH ${moves.join(', ')}, CHECKSUM; DBCC CHECKDB ([${restoredDatabase}]) WITH NO_INFOMSGS;`);
  const restored = new PrismaClient({ datasourceUrl: connection.replace(`database=${database}`, `database=${restoredDatabase}`), log: [] });
  try { assert.deepEqual(await snapshot(restored), before, 'Restored database must match every original table and record'); }
  finally { await restored.$disconnect(); }
  const hostFile = path.join(artifacts, 'database.bak');
  docker('cp', `tm-sqlserver:${backupFile}`, hostFile);
  await json(path.join(artifacts, 'database-before.json'), before);
  await json(manifestPath, {
    database, restoredDatabase, backupFile, hostFile, createdAt: new Date().toISOString(),
    sha256: hash(await readFile(hostFile)), tables: Object.fromEntries(Object.entries(before).map(([name, rows]) => [name, { count: rows.length, sha256: hash(JSON.stringify(rows)) }])),
    verification: ['BACKUP COPY_ONLY WITH CHECKSUM', 'RESTORE VERIFYONLY WITH CHECKSUM', 'RESTORE to isolated database', 'DBCC CHECKDB', 'Exact restored record comparison for every table'],
  });
  const protect = spawnSync(process.execPath, [path.join(web, 'scripts/article-foundation/protect-backup.mjs')], { cwd: web, encoding: 'utf8', windowsHide: true });
  assert.equal(protect.status, 0, protect.stderr);
  console.log(`Verified encrypted backup: ${hostFile}.enc. Isolated restore: ${restoredDatabase}. No live records changed.`);
} finally { await db.$disconnect(); }
