import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {test} from 'node:test';
import {PrismaClient} from '@prisma/client';
import {parseArticleDocument} from '../src/lib/articles/document';
import {preservedDefinitions} from '../src/lib/articles/preserved';
import {articleComponentRegistry} from '../src/lib/articles/component-registry';
import {changeArticle, legacyToken, loadArticleEditor} from '../src/server/services/article-revisions';

test('migration documents contain all extracted editorial fields, seven versioned graphs and six introduction sections', async () => {
  const manifest=JSON.parse(await readFile('private/article-foundation/phase4-2026-11-24/migration-manifest.json','utf8'));
  assert.equal(manifest.entries.length,4);let graphs=0;
  for(const entry of manifest.entries){
    const doc=parseArticleDocument(entry.document);
    for(const block of doc.blocks){assert.equal(block.type,'preserved');if(block.type!=='preserved')throw Error();
      assert.deepEqual(Object.keys(block.fields),Object.keys(preservedDefinitions[block.preset]!.fields));
      graphs+=block.visuals.length;
      for(const visual of block.visuals)articleComponentRegistry.validate(visual);
    }
    const bad=JSON.parse(entry.document);delete bad.blocks[0].fields[Object.keys(bad.blocks[0].fields)[0]!];assert.throws(()=>parseArticleDocument(JSON.stringify(bad)));
    const missing=JSON.parse(entry.document);missing.blocks.push({type:'prose',id:'unapproved',format:'html',content:'<p>x</p>'});assert.throws(()=>parseArticleDocument(JSON.stringify(missing)));
    const unsafe=JSON.parse(entry.document);const field=Object.entries(preservedDefinitions[unsafe.blocks[0].preset]!.fields).find(([,s])=>s.kind==='image');if(field){unsafe.blocks[0].fields[field[0]]='javascript:alert(1)';assert.throws(()=>parseArticleDocument(JSON.stringify(unsafe)));}
  }
  assert.equal(graphs,7);
  assert.equal(JSON.parse(manifest.entries.find((e:{kind:string})=>e.kind==='evergreen').document).blocks.length,6);
});

test('isolated migrated drafts and revision publication retain live fields, graph geometry, bylines and publication dates',async()=>{
  process.loadEnvFile('.env');
  const backup=JSON.parse(await readFile('private/article-foundation/phase4-2026-11-24/backup.json','utf8'));
  assert.match(backup.restoredDatabase,/^article_foundation_restore_\d+$/);
  const db=new PrismaClient({datasourceUrl:process.env.DATABASE_URL!.replace(/database=[^;]+/,`database=${backup.restoredDatabase}`)});
  try{
    const actor=await db.user.findFirstOrThrow({where:{isActive:true}});
    const posts=await db.post.findMany({include:{publishedRevision:true}});assert.equal(posts.length,4);
    for(const post of posts){
      const editor=(await loadArticleEditor(db,post.id))!;assert.equal(editor.diverged,false);
      const doc=JSON.parse(editor.input.body.serialized),first=doc.blocks[0],key=Object.keys(first.fields).find(key=>!first.fields[key].startsWith('/'))!;
      first.fields[key]+=' isolated contract test';
      const input={...editor.input,body:{format:'document' as const,serialized:JSON.stringify(doc)}};
      const command={id:post.id,actorId:actor.id,expectedVersion:post.version,expectedLegacyToken:legacyToken(post),input};
      await changeArticle(db,{...command,intent:'save'});
      await assert.rejects(changeArticle(db,{...command,intent:'save'}),/სხვა ფანჯარაში/);
      const saved=(await loadArticleEditor(db,post.id))!;assert.equal(saved.post.publishedRevisionId,post.publishedRevisionId);assert.equal(saved.post.content,post.content);
      await changeArticle(db,{...command,expectedVersion:saved.post.version,expectedLegacyToken:legacyToken(saved.post),intent:'publish'});
      const published=(await loadArticleEditor(db,post.id))!;
      for(const key of ['content','title','excerpt','coverImageUrl','status','updatedAt','publishedAt','authorId'] as const)assert.equal(JSON.stringify(published.post[key]),JSON.stringify(post[key]),`Live field ${key}`);
      assert.equal(published.diverged,false);
      assert.equal(published.post.publishedRevision!.editorialByline,post.publishedRevision!.editorialByline);
      assert.deepEqual(JSON.parse(published.post.publishedRevision!.document!).blocks.map((b:{visuals:unknown})=>b.visuals),JSON.parse(editor.input.body.serialized).blocks.map((b:{visuals:unknown})=>b.visuals));
      await assert.rejects(changeArticle(db,{...command,expectedVersion:published.post.version,expectedLegacyToken:legacyToken(published.post),intent:'unpublish'}));
      const invalid={...input,layoutKey:'standard-v1' as const};await assert.rejects(changeArticle(db,{...command,input:invalid,expectedVersion:published.post.version,expectedLegacyToken:legacyToken(published.post),intent:'save'}));
    }
  }finally{await db.$disconnect();}
});
