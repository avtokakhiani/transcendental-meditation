import assert from 'node:assert/strict';
import {spawnSync} from 'node:child_process';
import {readFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import {PrismaClient} from '@prisma/client';
import {artifacts, connection, db, snapshot, json, web} from './local.mjs';
const backup=JSON.parse(await readFile(path.join(artifacts,'backup.json'),'utf8'));
assert.match(backup.restoredDatabase,/^article_foundation_restore_\d+$/);
const client=new PrismaClient({datasourceUrl:connection.replace(/database=[^;]+/,`database=${backup.restoredDatabase}`)});
try{
  const before=await snapshot(client);
  const result=spawnSync(process.execPath,[path.join(web,'node_modules/tsx/dist/cli.mjs'),'scripts/article-foundation/phase4-migrate.mjs','apply','--isolated'],{cwd:web,env:process.env,encoding:'utf8',windowsHide:true});
  assert.notEqual(result.status,0);assert.match(result.stderr,/later edits|editorial content changed/);
  assert.deepEqual(await snapshot(client),before,'Rejected import must not partially change any record');
  await json(path.join(artifacts,'collision-verification.json'),{passed:true,editedArticleRejected:true,noPartialWrites:true});
  console.log('Importer rejected later editorial changes atomically; every record unchanged.');
}finally{await client.$disconnect();await db.$disconnect();}
