import assert from 'node:assert/strict';
import {readFile,writeFile,unlink} from 'node:fs/promises';
import path from 'node:path';
import console from 'node:console';
import {spawnSync} from 'node:child_process';
import {PrismaClient} from '@prisma/client';
import {artifacts,db,database,connection,readProtected,snapshot,hash,json} from './local.mjs';
assert.equal(path.basename(artifacts),'phase6-2026-11-24');
const manifest=JSON.parse(await readFile(path.join(artifacts,'backup.json'),'utf8'));
const target=manifest.restoredDatabase;assert.match(target,/^article_foundation_restore_\d+$/);assert.notEqual(target,database);
const local=path.join(artifacts,'phase6-recovery-staging.bak'),remote=`/var/opt/mssql/data/phase6_recovery_${target.slice('article_foundation_restore_'.length)}.bak`;
function docker(args){const result=spawnSync('docker',args,{encoding:'utf8',windowsHide:true});assert.equal(result.status,0,result.stderr);return result.stdout;}
function sql(query){return docker(['exec','tm-sqlserver','/bin/bash','-c','exec /opt/mssql-tools18/bin/sqlcmd -S localhost -U sa -P "$MSSQL_SA_PASSWORD" -C -b -Q "$1"','--',query]);}
try{
  const original=JSON.parse((await readProtected(path.join(artifacts,'database-before.json'))).toString()),digest=hash(JSON.stringify(original));assert.equal(hash(JSON.stringify(await snapshot())),digest,'Working database must not be touched');
  const exists=(await db.$queryRaw`SELECT name FROM sys.databases WHERE name=${target}`).length>0;
  const files=exists?await db.$queryRawUnsafe(`SELECT name,physical_name FROM [${target}].sys.database_files ORDER BY file_id`):(await db.$queryRaw`SELECT name,type FROM sys.database_files ORDER BY file_id`).map((file,index)=>({...file,physical_name:`/var/opt/mssql/data/${target}_${index}.${file.type===1?'ldf':'mdf'}`}));
  const moves=files.map(file=>{assert.match(file.name,/^[a-zA-Z0-9_-]+$/);assert.ok(file.physical_name.startsWith(`/var/opt/mssql/data/${target}_`));assert.match(file.physical_name,/^\/var\/opt\/mssql\/data\/article_foundation_restore_\d+_\d+\.(mdf|ldf)$/);return `MOVE N'${file.name}' TO N'${file.physical_name}'`;});
  const bytes=await readProtected(path.join(artifacts,'database.bak'));assert.equal(hash(bytes),manifest.sha256);await writeFile(local,bytes,{flag:'wx'});docker(['cp',local,`tm-sqlserver:${remote}`]);
  sql(`RESTORE VERIFYONLY FROM DISK=N'${remote}' WITH CHECKSUM; ${exists?`ALTER DATABASE [${target}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE;`:''} RESTORE DATABASE [${target}] FROM DISK=N'${remote}' WITH ${exists?'REPLACE,':''}CHECKSUM,${moves.join(',')}; ALTER DATABASE [${target}] SET MULTI_USER; DBCC CHECKDB ([${target}]) WITH NO_INFOMSGS;`);
  const restored=new PrismaClient({datasourceUrl:connection.replace(/database=[^;]+/,`database=${target}`)});
  try{assert.equal(hash(JSON.stringify(await snapshot(restored))),digest);}finally{await restored.$disconnect();}
  assert.equal(hash(JSON.stringify(await snapshot())),digest);
  await json(path.join(artifacts,'recovery-verification.json'),{passed:true,restoredOnly:target,createdFreshTarget:!exists,encryptedNativeBackupRestored:true,checksumAndDbccPassed:true,everyRestoredTableExact:true,workingDatabaseUntouched:true});
  console.log('Encrypted Phase 6 backup restored again to the disposable database; DBCC and all-table equality passed; working database unchanged.');
}finally{await unlink(local).catch(error=>{if(error.code!=='ENOENT')throw error;});docker(['exec','tm-sqlserver','rm','-f','--',remote]);await db.$disconnect();}
