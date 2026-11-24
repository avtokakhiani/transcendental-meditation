import {mkdir,cp,readFile} from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import console from 'node:console';
import {artifacts,db,web,json} from './local.mjs';
try{
  assert.equal(path.basename(artifacts),'phase5-rollback-2026-11-24');
  const source=path.join(web,'private/article-foundation/phase5-2026-11-24');
  const inventory=JSON.parse(await readFile(path.join(source,'inventory.json'),'utf8'));
  await mkdir(path.join(artifacts,'before'),{recursive:true});
  const routes=inventory.routes.filter(route=>route==='/'||route==='/blog'||route.startsWith('/blog/'));
  for(const route of routes)for(const width of inventory.widths)for(const extension of ['json','png']){
    const file=`${route==='/'?'home':route.slice(1).replaceAll('/','__')}-${width}.${extension}`;
    await cp(path.join(source,'before',file),path.join(artifacts,'before',file),{force:false});
  }
  await json(path.join(artifacts,'inventory.json'),{...inventory,routes});
  await cp(path.join(source,'reviewed-source-changes.json'),path.join(artifacts,'reviewed-source-changes.json'));
  console.log('Rollback comparison prepared from approved originals; no baseline regenerated.');
}finally{await db.$disconnect();}
