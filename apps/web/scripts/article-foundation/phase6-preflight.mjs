import assert from 'node:assert/strict';
import {readFile,cp} from 'node:fs/promises';
import path from 'node:path';
import console from 'node:console';
import process from 'node:process';
import {artifacts,db,snapshot,readProtected,json,hash,web,sourceInventory,files} from './local.mjs';
import {getPublishedArticle,listPublishedArticles} from '../../src/server/services/published-articles.ts';
import {hasLegacyDivergence} from '../../src/server/services/article-revisions.ts';
try{
  assert.equal(path.basename(artifacts),'phase6-2026-11-24');
  const original=JSON.parse((await readProtected(path.join(artifacts,'database-before.json'))).toString());
  assert.equal(hash(JSON.stringify(await snapshot())),hash(JSON.stringify(original)),'Working records changed; inspect table hashes privately');
  const posts=await db.post.findMany({include:{publishedRevision:true}});assert.equal(posts.length,4);assert.equal(await db.postRevision.count(),8);
  for(const post of posts){assert.ok(await getPublishedArticle(db,post.slug));assert.equal(post.publishedRevisionId,post.draftRevisionId);assert.equal(hasLegacyDivergence(post,post.publishedRevision),false);}
  assert.equal((await listPublishedArticles(db)).length,3);
  for(const file of await files(path.join(web,'src'))){if(!/\.(ts|tsx)$/.test(file))continue;const code=await readFile(file,'utf8');assert.ok(!/usesUnifiedArticles|ARTICLE_PUBLIC_DELIVERY|article-card-copy|\/archive\/|content\/articles['"]|legacy-delivery/.test(code),`Legacy runtime dependency: ${path.relative(web,file)}`);}
  await json(path.join(artifacts,'preflight.json'),{passed:true,posts:4,revisions:8,chronologicalArticles:3,evergreenPages:1,allWorkingRecordsUnchanged:true,noCompetingRuntimeArticleSource:true});
  if(!process.argv.includes('--records-only')){
    const baseline=path.join(web,'private/article-foundation/2026-11-24');
    await cp(path.join(baseline,'before'),path.join(artifacts,'before'),{recursive:true,force:false});await cp(path.join(baseline,'inventory.json'),path.join(artifacts,'inventory.json'),{force:false});
    const inventory=JSON.parse(await readFile(path.join(artifacts,'inventory.json'),'utf8')),current=await sourceInventory();
    // Reviewed changes: runtime cutover, archive moves, type-only presentation imports,
    // article-only admin refinements and optional component geometry. No public CSS changes.
    const approved=new Set([...Object.keys(JSON.parse(await readFile(path.join(web,'private/article-foundation/phase5-2026-11-24/reviewed-source-changes.json'),'utf8'))),
      'src/content/articles.ts','src/content/article-card-copy.ts','src/content/related-articles.ts','src/content/article-layouts.ts','src/components/post-article.tsx',
      ...['heart-article-hero','sleep-article-hero','stress-article-hero','standard-article'].map(name=>`src/app/(site)/blog/[slug]/${name}.tsx`),
      'src/app/(site)/blog/article-image.tsx','src/components/articles/document-renderer.tsx',
      'src/components/admin/admin-nav.tsx','src/components/admin/post-form.tsx','src/components/admin/cover-field.tsx',
      'src/components/admin/article-document-editor.tsx','src/components/admin/preserved-article-editor.tsx',
      'src/app/admin/(panel)/posts/page.tsx','src/app/admin/(panel)/posts/new/page.tsx','src/app/admin/(panel)/posts/[id]/page.tsx','src/app/admin/(panel)/posts/actions.ts',
      'src/lib/articles/document.ts','src/lib/articles/component-registry.ts','src/server/services/article-revisions.ts']);
    const changed=Object.keys(inventory.sources).filter(file=>inventory.sources[file]!==current[file]);for(const file of changed)assert.ok(approved.has(file),`Unreviewed file: ${file}`);
    await json(path.join(artifacts,'reviewed-source-changes.json'),Object.fromEntries(changed.map(file=>[file,current[file]??null])));
  }
  console.log('Phase 6 preflight passed: four original articles/eight revisions intact; database-only public delivery; every working record unchanged.');
}finally{await db.$disconnect();}
