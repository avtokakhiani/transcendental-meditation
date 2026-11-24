import assert from 'node:assert/strict';
import {test} from 'node:test';
import {readFile} from 'node:fs/promises';
import {randomUUID} from 'node:crypto';
import {PrismaClient} from '@prisma/client';
import {publishedArticleMetadata} from '../src/server/article-metadata';
import {articleInputSchema} from '../src/lib/articles/authoring';
import {changeArticle,legacyToken,loadArticleEditor} from '../src/server/services/article-revisions';
import {getPublishedArticle,listPublishedArticles,relatedPublishedArticles,validatedPublishedArticle} from '../src/server/services/published-articles';

test('isolated unified publication, replacement drafts, aliases, scheduling, migrated revisions and essential protection',async()=>{
  process.loadEnvFile('.env');
  const backup=JSON.parse(await readFile(`private/article-foundation/${process.env.ARTICLE_BACKUP_RUN??'phase5-2026-11-24'}/backup.json`,'utf8'));
  assert.match(backup.restoredDatabase,/^article_foundation_restore_\d+$/);
  const db=new PrismaClient({datasourceUrl:process.env.DATABASE_URL!.replace(/database=[^;]+/,`database=${backup.restoredDatabase}`)});
  const originals=await db.post.findMany(),revisionIds=(await db.postRevision.findMany({select:{id:true}})).map(r=>r.id);
  assert.equal(originals.length,4,'Run database-mutating suites sequentially on a clean disposable restore');assert.equal(revisionIds.length,8);
  let id:string|undefined;
  const raceSlug=`race-${randomUUID()}`;
  const slug=`unified-test-${randomUUID()}`;
  const input=articleInputSchema.parse({title:'Published title',slug,displayHeading:'Public heading',cardTitle:'Published card',excerpt:'Published excerpt',cardExcerpt:'Published card excerpt',editorialByline:'Editorial author',category:'Research',coverImageUrl:null,coverImageAlt:null,coverCrop:'center',seoTitle:'Published SEO',seoDescription:'Published SEO description',layoutKey:'standard-v1',body:{format:'document',serialized:JSON.stringify({version:1,sources:[],blocks:[{type:'prose',id:'copy',format:'html',content:'<h2>Published body</h2><p>English and ქართული content.</p>'}]})}});
  try{
    const actor=await db.user.findFirstOrThrow({where:{isActive:true}});
    const save=await changeArticle(db,{expectedVersion:0,expectedLegacyToken:'',actorId:actor.id,intent:'save',input});id=save.id;
    const mutate=async(intent:'save'|'publish'|'restore'|'unpublish'|'alias',next=input,revisionId?:string,aliasSlug?:string)=>{const post=await db.post.findUniqueOrThrow({where:{id}});return changeArticle(db,{id,expectedVersion:post.version,expectedLegacyToken:legacyToken(post),actorId:actor.id,intent,input:next,revisionId,aliasSlug});};
    assert.equal(await getPublishedArticle(db,slug),null);assert.equal((await listPublishedArticles(db)).length,3);
    await mutate('publish',{...input,displayHeading:null,cardTitle:null,cardExcerpt:null,excerpt:null,seoTitle:null,seoDescription:null});
    const defaults=(await getPublishedArticle(db,slug))!;assert.equal(defaults.title,input.title);assert.ok(defaults.description.includes('Published body'));assert.equal(publishedArticleMetadata(defaults).title,input.title);assert.equal(publishedArticleMetadata(defaults).description,defaults.description);
    for(const asset of [`/api/media/${randomUUID()}`,'/images/phase6-missing-registered-graph.svg']){
      const document={version:1,sources:[],blocks:[{type:'component',id:'asset-check',reference:{componentId:'preserved.heart.graph1',componentVersion:1,props:{fields:{f25:asset,f26:'Graph'}}},summary:'Validated asset',sourceIds:[]}]};
      const stable:number=await db.postRevision.count({where:{postId:id}});await assert.rejects(mutate('publish',{...input,body:{format:'document',serialized:JSON.stringify(document)}}));assert.equal(await db.postRevision.count({where:{postId:id}}),stable);
    }
    await mutate('publish');const first=(await getPublishedArticle(db,slug))!;assert.equal(first.title,'Published card');assert.equal(publishedArticleMetadata(first).title,'Published SEO');assert.equal((await listPublishedArticles(db))[0]!.slug,slug);
    const originalDate=first.publishedAt,originalRevision=first.revision.id;
    const lastCount=await db.postRevision.count({where:{postId:id}});
    await assert.rejects(mutate('publish',{...input,layoutKey:'stress-v1'}));
    assert.equal(await db.postRevision.count({where:{postId:id}}),lastCount,'Invalid publication must not leave a revision or change the live pointer');
    assert.equal((await getPublishedArticle(db,slug))!.revision.id,originalRevision);
    const replacement={...input,title:'Private replacement',cardTitle:'Private card',seoTitle:'Private SEO',body:{format:'document' as const,serialized:input.body.serialized.replace('Published body','Private body')}};
    await mutate('save',replacement);const live=(await getPublishedArticle(db,slug))!;
    assert.equal(live.revision.id,originalRevision);assert.equal(publishedArticleMetadata(live).title,'Published SEO');assert.ok(!JSON.stringify(await listPublishedArticles(db)).includes('Private body'));
    await mutate('publish',replacement);assert.equal((await getPublishedArticle(db,slug))!.revision.title,'Private replacement');assert.equal((await getPublishedArticle(db,slug))!.publishedAt,originalDate);
    await mutate('restore',input,originalRevision);assert.equal((await getPublishedArticle(db,slug))!.revision.title,'Private replacement');
    const restored=(await loadArticleEditor(db,id))!.input;await mutate('publish',restored);assert.equal((await getPublishedArticle(db,slug))!.revision.title,'Published title');
    const alias=`alias-${randomUUID()}`;await mutate('alias',input,undefined,alias);const aliasResult=(await getPublishedArticle(db,alias))!;assert.equal(aliasResult.isAlias,true);assert.equal(aliasResult.canonicalSlug,slug);
    const prior=await db.post.findUniqueOrThrow({where:{id}});
    const race=await Promise.allSettled([
      changeArticle(db,{expectedVersion:0,expectedLegacyToken:'',actorId:actor.id,intent:'save',input:{...input,slug:raceSlug}}),
      changeArticle(db,{id,expectedVersion:prior.version,expectedLegacyToken:legacyToken(prior),actorId:actor.id,intent:'alias',aliasSlug:raceSlug}),
    ]);
    assert.equal(race.filter(result=>result.status==='fulfilled').length,1);
    assert.equal(await db.post.count({where:{slug:raceSlug}})+await db.postSlugAlias.count({where:{slug:raceSlug}}),1,'Canonical/alias namespace collision must be impossible');
    await assert.rejects(mutate('alias',input,undefined,originals[0]!.slug));
    const catalog=await listPublishedArticles(db);assert.ok(relatedPublishedArticles(slug,catalog).every(a=>a.slug!==slug&&a.kind==='article'));assert.equal(catalog.some(a=>a.kind==='evergreen'),false);
    const post=await db.post.findUniqueOrThrow({where:{id},include:{publishedRevision:true}});
    assert.equal(validatedPublishedArticle({...post,status:'draft'}),null);
    assert.equal(validatedPublishedArticle({...post,publishedAt:new Date(Date.now()+86400000)}),null);
    assert.equal(validatedPublishedArticle({...post,publishedRevisionPostId:randomUUID()}),null);
    assert.equal(validatedPublishedArticle({...post,publishedRevision:{...post.publishedRevision!,documentVersion:99}}),null);
    assert.equal(validatedPublishedArticle({...post,publishedRevision:{...post.publishedRevision!,document:JSON.stringify({version:1,sources:[],blocks:[{type:'component',id:'bad',reference:{componentId:'arbitrary.script',componentVersion:1,props:{}},summary:'bad',sourceIds:[]}]})}}),null);
    const sameDate=catalog.map(article=>({...article,publishedAt:originalDate}));assert.deepEqual(relatedPublishedArticles(slug,sameDate).map(a=>a.slug),sameDate.filter(a=>a.slug!==slug).map(a=>a.slug).sort());
    await mutate('unpublish');assert.equal(await getPublishedArticle(db,slug),null);assert.equal(await getPublishedArticle(db,alias),null);assert.ok(!(await listPublishedArticles(db)).some(a=>a.slug===slug));
    await mutate('publish',input);assert.equal((await getPublishedArticle(db,slug))!.publishedAt,originalDate);
    // Every migrated layout publishes edited document data, never the stale code-managed body.
    for(const original of originals){
      const editor=(await loadArticleEditor(db,original.id))!,doc=JSON.parse(editor.input.body.serialized);
      doc.blocks[0].fields.f4+=' [isolated-publication]';
      const changed={...editor.input,body:{format:'document' as const,serialized:JSON.stringify(doc)}};
      await changeArticle(db,{id:original.id,expectedVersion:editor.post.version,expectedLegacyToken:editor.legacyToken,actorId:actor.id,intent:'publish',input:changed});
      const publicArticle=(await getPublishedArticle(db,original.slug))!;assert.ok(publicArticle.revision.document!.includes('[isolated-publication]'));assert.equal(publicArticle.publishedAt,original.publishedAt!.toISOString());
      const current=await db.post.findUniqueOrThrow({where:{id:original.id}});
      if(original.kind==='evergreen')for(const intent of ['delete','unpublish'] as const)await assert.rejects(changeArticle(db,{id:original.id,expectedVersion:current.version,expectedLegacyToken:legacyToken(current),actorId:actor.id,intent}));
      else{await changeArticle(db,{id:original.id,expectedVersion:current.version,expectedLegacyToken:legacyToken(current),actorId:actor.id,intent:'unpublish'});assert.equal(await getPublishedArticle(db,original.slug),null);}
    }
  }finally{
    if(id)await db.post.delete({where:{id}});
    await db.post.deleteMany({where:{slug:raceSlug}});
    await db.$transaction(async tx=>{for(const original of originals){const {id,...data}=original;await tx.post.update({where:{id},data});}await tx.postRevision.deleteMany({where:{id:{notIn:revisionIds}}});});
    await db.$disconnect();
  }
});
