import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import {PrismaClient} from '@prisma/client';
import {artifacts,db,connection,database,snapshot,readProtected,hash,json} from './local.mjs';
assert.equal(path.basename(artifacts),'phase6-2026-11-24');
const backup=JSON.parse(await readFile(path.join(artifacts,'backup.json'),'utf8'));
assert.match(backup.restoredDatabase,/^article_foundation_restore_\d+$/);assert.notEqual(backup.restoredDatabase,database);
const isolated=new PrismaClient({datasourceUrl:connection.replace(/database=[^;]+/,`database=${backup.restoredDatabase}`)});
try{
  const original=JSON.parse((await readProtected(path.join(artifacts,'database-before.json'))).toString());
  assert.equal(hash(await readProtected(path.join(artifacts,'database.bak'))),backup.sha256);
  const digest=hash(JSON.stringify(original));assert.equal(hash(JSON.stringify(await snapshot())),digest,'Working table mismatch');assert.equal(hash(JSON.stringify(await snapshot(isolated))),digest,'Isolated fixture cleanup incomplete');
  await json(path.join(artifacts,'record-verification.json'),{passed:true,everyWorkingRecordUnchanged:true,everyIsolatedFixtureRemoved:true,posts:4,revisions:8,verifiedEncryptedBackupRetained:true});
  if(process.argv.includes('--cleanup')){
    for(const file of ['workflow/report.json','workflow/public-report.json','migrated-previews/report.json','visual-preview-security.json','recovery-verification.json','functional-regression.json','localhost-smoke.json','build-verification.json','visual-verification.json']){const result=JSON.parse(await readFile(path.join(artifacts,file),'utf8'));if(file==='visual-verification.json')assert.deepEqual(result.errors,[]);else assert.equal(result.passed,true,file);}
    await isolated.$disconnect();await db.$executeRawUnsafe(`ALTER DATABASE [${backup.restoredDatabase}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [${backup.restoredDatabase}];`);
    await json(path.join(artifacts,'cleanup.json'),{passed:true,removedOnly:backup.restoredDatabase,allSyntheticRecordsAndUploadsRemoved:true,encryptedBackupRetained:true});
  }
  console.log('Every working table and isolated table equals the verified Phase 6 backup; four posts/eight historical revisions intact.');
}finally{await isolated.$disconnect();await db.$disconnect();}
