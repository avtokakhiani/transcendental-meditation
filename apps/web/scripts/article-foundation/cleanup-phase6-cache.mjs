import assert from 'node:assert/strict';
import {realpath,lstat,rm,readFile,unlink} from 'node:fs/promises';
import path from 'node:path';
import console from 'node:console';
import process from 'node:process';
import {artifacts,db,web,json} from './local.mjs';
try{
  assert.equal(path.basename(artifacts),'phase6-2026-11-24');
  assert.equal(JSON.parse(await readFile(path.join(artifacts,'build-verification.json'),'utf8')).passed,true);
  const workspace=await realpath(web),target=path.join(workspace,'.next','article-tests');
  assert.equal(path.relative(workspace,target),path.join('.next','article-tests'));
  try{
    const resolved=await realpath(target),info=await lstat(target);
    assert.equal(resolved.toLowerCase(),target.toLowerCase());assert.equal(info.isSymbolicLink(),false);assert.equal(info.isDirectory(),true);
    // Native fs.rm unlinks child symlinks/junctions instead of following their targets.
    // Run only after the isolated dev server and local build have both stopped.
    await rm(target,{recursive:true,force:false,maxRetries:3,retryDelay:1000});
  }catch(error){if(error.code!=='ENOENT')throw error;}
  await assert.rejects(lstat(target),{code:'ENOENT'});
  const backup=JSON.parse(await readFile(path.join(artifacts,'backup.json'),'utf8')),removedKnownFiles=[];
  const known=[path.join(workspace,'.next','corporate-desktop.png'),path.join(workspace,'.next','corporate-mobile.png')];
  if(process.env.TEMP)known.push(path.join(await realpath(process.env.TEMP),'learntm-reader-protected-print.pdf'));
  for(const file of known)try{const info=await lstat(file);if(info.isFile()&&info.mtimeMs>=Date.parse(backup.createdAt)){await unlink(file);removedKnownFiles.push(path.basename(file));}}catch(error){if(error.code!=='ENOENT')throw error;}
  await json(path.join(artifacts,'cache-cleanup.json'),{passed:true,removedOnly:'.next/article-tests',removedKnownTestFiles:removedKnownFiles,mainDevOutputRetained:true,sourceMediaAndOriginalBackupsRetained:true});
  console.log('Removed only verified isolated test/build output; main development output and original private data retained.');
}finally{await db.$disconnect();}
