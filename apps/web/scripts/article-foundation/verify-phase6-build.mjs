import assert from 'node:assert/strict';
import {spawn} from 'node:child_process';
import {readFile,writeFile} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import {artifacts,db,connection,web,snapshot,hash,json} from './local.mjs';
assert.equal(path.basename(artifacts),'phase6-2026-11-24');
const backup=JSON.parse(await readFile(path.join(artifacts,'backup.json'),'utf8'));assert.match(backup.restoredDatabase,/^article_foundation_restore_\d+$/);
try{
  await json(path.join(artifacts,'build-verification.json'),{passed:false,inProgress:true});
  const before=hash(JSON.stringify(await snapshot()));await db.$disconnect();
  const child=spawn(process.execPath,[path.join(web,'node_modules/next/dist/bin/next'),'build'],{cwd:web,windowsHide:true,env:{...process.env,ARTICLE_TEST_SERVER:'true',DATABASE_URL:connection.replace(/database=[^;]+/,`database=${backup.restoredDatabase}`),NEXT_TELEMETRY_DISABLED:'1'},stdio:['ignore','pipe','pipe']});
  let output='';for(const stream of [child.stdout,child.stderr])stream.on('data',chunk=>{output+=chunk.toString();process.stdout.write(chunk);});
  const code=await new Promise((resolve,reject)=>{child.on('error',reject);child.on('exit',resolve);});await writeFile(path.join(artifacts,'build.log'),output);
  if(code!==0)await json(path.join(artifacts,'build-verification.json'),{passed:false,exitCode:code});
  assert.equal(code,0,'See local build.log');assert.equal(hash(JSON.stringify(await snapshot())),before,'Build must not change working records');
  await json(path.join(artifacts,'build-verification.json'),{passed:true,command:'next build',isolatedOutput:'.next/article-tests',database:'disposable verified restore',productionServerStarted:false,workingDatabaseUntouched:true});
  console.log('Complete production build passed locally with isolated output; working records unchanged.');
}finally{await db.$disconnect();}
