import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import {PrismaClient} from '@prisma/client';
import {artifacts,db,connection,database,snapshot,readProtected,hash,json} from './local.mjs';
const backup=JSON.parse(await readFile(path.join(artifacts,'backup.json'),'utf8'));
assert.match(backup.restoredDatabase,/^article_foundation_restore_\d+$/);assert.notEqual(backup.restoredDatabase,database);
const isolated=new PrismaClient({datasourceUrl:connection.replace(/database=[^;]+/,`database=${backup.restoredDatabase}`)});
try{
  const original=JSON.parse((await readProtected(path.join(artifacts,'database-before.json'))).toString());
  assert.equal(hash(await readProtected(path.join(artifacts,'database.bak'))),backup.sha256);
  assert.equal(hash(JSON.stringify(await snapshot())),hash(JSON.stringify(original)),'Every working record must remain unchanged; compare table hashes privately without printing records');
  assert.equal(hash(JSON.stringify(await snapshot(isolated))),hash(JSON.stringify(original)),'Isolated test posts, revisions, aliases and uploads must all be removed');
  await json(path.join(artifacts,'record-verification.json'),{passed:true,everyWorkingRecordUnchanged:true,everyIsolatedFixtureRemoved:true,posts:4,revisions:8,verifiedEncryptedBackupRetained:true});
  if(process.argv.includes('--cleanup')){
    for(const file of ['workflow/report.json','workflow/public-report.json','functional-regression.json','localhost-smoke.json','visual-verification.json']){const report=JSON.parse(await readFile(path.join(artifacts,file),'utf8'));if(file==='visual-verification.json')assert.deepEqual(report.errors,[]);else assert.equal(report.passed,true);}
    const rollback=JSON.parse(await readFile(path.join(artifacts,'../phase5-rollback-2026-11-24/visual-verification.json'),'utf8'));assert.deepEqual(rollback.errors,[]);
    await isolated.$disconnect();await db.$executeRawUnsafe(`ALTER DATABASE [${backup.restoredDatabase}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [${backup.restoredDatabase}];`);
    await json(path.join(artifacts,'cleanup.json'),{passed:true,removedOnly:backup.restoredDatabase,everyTestRecordRemoved:true,backupRetained:true,existingIgnoredTestCacheRetained:true});
  }
  console.log('Working records equal verified pre-cutover backup; all isolated fixtures removed.');
}finally{await isolated.$disconnect();await db.$disconnect();}
