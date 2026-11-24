import assert from 'node:assert/strict';
import {readFile,cp} from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import {artifacts,db,snapshot,readProtected,json,hash,web} from './local.mjs';
import {getPublishedArticle,listPublishedArticles} from '../../src/server/services/published-articles.ts';
import {hasLegacyDivergence} from '../../src/server/services/article-revisions.ts';
try {
  assert.equal(path.basename(artifacts),'phase5-2026-11-24');
  const before=JSON.parse((await readProtected(path.join(artifacts,'database-before.json'))).toString());
  assert.deepEqual(await snapshot(),before,'Cutover must not alter working content or unrelated records');
  const rows=await db.post.findMany({include:{publishedRevision:true}});assert.equal(rows.length,4);
  for(const row of rows){assert.equal(hasLegacyDivergence(row,row.publishedRevision),false);assert.equal(row.draftRevisionId,row.publishedRevisionId,'Pending draft requires explicit review');assert.ok(await getPublishedArticle(db,row.slug));}
  assert.equal((await listPublishedArticles(db)).length,3);
  await json(path.join(artifacts,'preflight.json'),{passed:true,publishedRevisionsValidated:4,chronologicalArticles:3,evergreenPages:1,noPendingDrafts:true,noLegacyDivergence:true,everyWorkingRecordMatchesBackup:true});
  if(!process.argv.includes('--records-only')){
    const baseline=path.join(web,'private/article-foundation/2026-11-24');
    await cp(path.join(baseline,'before'),path.join(artifacts,'before'),{recursive:true,force:false});await cp(path.join(baseline,'inventory.json'),path.join(artifacts,'inventory.json'),{force:false});
    const previous=JSON.parse(await readFile(path.join(web,'private/article-foundation/phase4-2026-11-24/reviewed-source-changes.json'),'utf8'));
    const reviewed=[...Object.keys(previous),'src/app/(site)/page.tsx','src/app/(site)/blog/[slug]/page.tsx','src/app/(site)/blog/latest-articles.tsx','src/components/landing/latest-posts.tsx','src/components/related-articles.tsx'];
    await json(path.join(artifacts,'reviewed-source-changes.json'),Object.fromEntries(await Promise.all(reviewed.map(async file=>[file,hash(await readFile(path.join(web,file)))]))));
  }
  console.log('Four validated published revisions; three chronological articles; no pending drafts/divergence; all working records unchanged.');
}finally{await db.$disconnect();}
