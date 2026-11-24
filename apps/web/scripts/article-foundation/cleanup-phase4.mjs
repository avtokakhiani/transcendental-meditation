import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import console from 'node:console';
import {PrismaClient} from '@prisma/client';
import {artifacts, connection, database, db, snapshot, readProtected, hash, json} from './local.mjs';
const backup=JSON.parse(await readFile(path.join(artifacts,'backup.json'),'utf8'));
assert.match(backup.restoredDatabase,/^article_foundation_restore_\d+$/);
assert.notEqual(backup.restoredDatabase,database);
const restored=new PrismaClient({datasourceUrl:connection.replace(/database=[^;]+/,`database=${backup.restoredDatabase}`)});
try{
  assert.equal(hash(await readProtected(path.join(artifacts,'database.bak'))),backup.sha256);
  for(const file of ['record-verification.json','localhost-smoke.json','rollback-rehearsal.json','collision-verification.json','previews/report.json'])assert.equal(JSON.parse(await readFile(path.join(artifacts,file),'utf8')).passed,true,`Missing verification: ${file}`);
  const before=JSON.parse((await readProtected(path.join(artifacts,'database-before.json'))).toString()),isolated=await snapshot(restored);
  for(const table of Object.keys(before))if(!['posts','post_revisions'].includes(table))assert.deepEqual(isolated[table],before[table],`Test residue outside articles: ${table}`);
  await restored.$disconnect();
  await db.$executeRawUnsafe(`IF DB_ID(N'${backup.restoredDatabase}') IS NOT NULL BEGIN ALTER DATABASE [${backup.restoredDatabase}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [${backup.restoredDatabase}]; END`);
  await json(path.join(artifacts,'cleanup.json'),{passed:true,removedOnly:backup.restoredDatabase,allTestRecordsRemoved:true,unrelatedFixtureTablesRestoredExactly:true,verifiedEncryptedBackupRetained:true});
  console.log('Disposable migration rehearsal database removed; working articles, media and verified encrypted backup retained.');
}finally{await restored.$disconnect();await db.$disconnect();}
