/* global document, window, getComputedStyle, createImageBitmap, OffscreenCanvas, fetch */
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import process from 'node:process';
import console from 'node:console';
import { URL } from 'node:url';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';
process.loadEnvFile('.env');
const run = process.env.ARTICLE_BACKUP_RUN??'phase4-2026-11-24', directory = `private/article-foundation/${run}/${run.startsWith('phase6')?'migrated-previews':'previews'}`;
await mkdir(directory, {recursive: true});
const backup = JSON.parse(await readFile(`private/article-foundation/${run}/backup.json`, 'utf8'));
assert.match(backup.restoredDatabase, /^article_foundation_restore_\d+$/);
const db = new PrismaClient({datasourceUrl: process.env.DATABASE_URL.replace(/database=[^;]+/, `database=${backup.restoredDatabase}`)});
const base = 'http://localhost:31998', browser = await chromium.launch({channel: 'chrome'});
const results = [], errors = [];
const originalPosts=await db.post.findMany(),originalRevisions=(await db.postRevision.findMany({select:{id:true}})).map(row=>row.id);
async function settle(page) {
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {for (let y=0;y<document.documentElement.scrollHeight;y+=700) {window.scrollTo(0,y); await new Promise(resolve=>window.setTimeout(resolve,40));} window.scrollTo(0,0); await Promise.all([...document.images].map(image=>image.decode().catch(()=>{})));});
  await page.waitForTimeout(400);
}
async function inventory(page) {
  return page.locator('main#main > article').evaluate(element => ({text: element.textContent, headings: [...element.querySelectorAll('h1,h2,h3')].map(item=>item.textContent), links: [...element.querySelectorAll('a')].map(item=>[item.textContent,item.getAttribute('href')]),
    elements: [...element.querySelectorAll('p,h1,h2,h3,figure,img,svg')].map(item => {const rect=item.getBoundingClientRect(), style=getComputedStyle(item);return {tag:item.tagName,text:item.textContent,src:item.getAttribute('src'),alt:item.getAttribute('alt'),rect:[rect.x,rect.y,rect.width,rect.height],font:style.fontFamily,size:style.fontSize,lineHeight:style.lineHeight,color:style.color};})}));
}
async function pixels(page, a, b) {
  return page.evaluate(async ([left,right])=>{
    async function decode(bytes) {const img=await createImageBitmap(await (await fetch(`data:image/png;base64,${bytes}`)).blob()); const canvas=new OffscreenCanvas(img.width,img.height),ctx=canvas.getContext('2d');ctx.drawImage(img,0,0);return {width:img.width,height:img.height,data:ctx.getImageData(0,0,img.width,img.height).data};}
    const [a,b]=await Promise.all([decode(left),decode(right)]); if(a.width!==b.width||a.height!==b.height)return {dimensionsChanged:true,a:[a.width,a.height],b:[b.width,b.height]};
    let outliers=0,different=0;for(let i=0;i<a.data.length;i+=4){let delta=0;for(let j=0;j<4;j++)delta=Math.max(delta,Math.abs(a.data[i+j]-b.data[i+j]));if(delta>0)different++;if(delta>10)outliers++;}return {different,outliers};
  },[a.toString('base64'),b.toString('base64')]);
}
try {
  const actor = await db.user.findFirstOrThrow({where:{role:'admin',isActive:true}});
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  context.setDefaultNavigationTimeout(120000);
  const payload=Buffer.from(JSON.stringify({userId:actor.id,expiresAt:Date.now()+3600000})).toString('base64url');
  await context.addCookies([{name:'tm_session',value:`${payload}.${createHmac('sha256',process.env.AUTH_SECRET).update(payload).digest('base64url')}`,url:base,httpOnly:true,sameSite:'Lax'}]);
  await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
  const page=await context.newPage();page.on('pageerror',error=>errors.push(error.message));page.on('dialog',dialog=>dialog.accept());
  const posts=await db.post.findMany({include:{publishedRevision:true}});
  assert.equal(posts.length,4);
  for(const post of posts){
    // Reset only disposable draft pointers after an interrupted rehearsal; preserve history.
    await db.post.update({where:{id:post.id},data:{draftRevisionId:post.publishedRevisionId,draftRevisionPostId:post.id,version:{increment:1},updatedAt:post.updatedAt}});
    for(const width of [1440,768,390]){
      await page.setViewportSize({width,height:1000});
      await page.goto(`${base}/blog/${post.slug}`,{waitUntil:'networkidle',timeout:120000});await settle(page);
      const original=await inventory(page),before=await page.screenshot({fullPage:true,animations:'disabled',caret:'hide',style:'nextjs-portal {visibility:hidden!important}'});
      const response=await page.goto(`${base}/admin/posts/${post.id}/preview`,{waitUntil:'networkidle',timeout:120000});await settle(page);
      assert.match(page.url(),/\/admin\/article-preview\//);assert.match(response.headers()['cache-control'],/no-store/);assert.match(response.headers()['x-robots-tag'],/noindex/);
      const migrated=await inventory(page),after=await page.screenshot({fullPage:true,animations:'disabled',caret:'hide',style:'nextjs-portal {visibility:hidden!important}'});
      await writeFile(`${directory}/${post.slug}-${width}-public.png`,before);await writeFile(`${directory}/${post.slug}-${width}-preview.png`,after);
      const comparison=await pixels(page,before,after);
      const entry={slug:post.slug,width,exactContentGeometry:JSON.stringify(original)===JSON.stringify(migrated),...comparison};results.push(entry);
      await writeFile(`${directory}/report.json`,JSON.stringify({results,errors},null,2));
      if(!entry.exactContentGeometry) await writeFile(`${directory}/${post.slug}-${width}-inventory.json`,JSON.stringify({original,migrated},null,2));
      assert.equal(entry.exactContentGeometry,true,`Content/geometry: ${post.slug} ${width}`);assert.ok(!comparison.dimensionsChanged&&comparison.outliers<=50,`Raster: ${post.slug} ${width}: ${JSON.stringify(comparison)}`);
    }
    // Real admin edit, saved preview and restore, exclusively in the disposable DB.
    await page.setViewportSize({width:1440,height:1000});
    await page.goto(`${base}/admin/posts/${post.id}`,{waitUntil:'networkidle'});
    const sections=JSON.parse(post.publishedRevision.document).blocks;
    assert.equal(await page.locator('[data-preserved-section]').count(),sections.length);
    if(run.startsWith('phase6'))for(const detail of await page.locator('[data-preserved-section] details').all()){await detail.locator('summary').click();await detail.locator('[data-component-preview] figure').waitFor({timeout:120000});}
    const field=page.locator('[data-preserved-field]').filter({visible:true}).first();
    const originalValue=await field.inputValue();
    // Choose a visible text field rather than an image or URL.
    const editable=page.locator('[data-preserved-field="section1.f4"]');
    assert.ok(editable); const text=await editable.inputValue();await editable.fill(text+' [isolated edit]');
    await page.getByRole('button',{name:'მონახაზის შენახვა',exact:true}).click();await page.waitForURL(/saved=1/);
    const draft=await db.post.findUniqueOrThrow({where:{id:post.id},include:{draftRevision:true}});
    assert.equal(draft.content,post.content);assert.equal(draft.publishedRevisionId,post.publishedRevisionId);
    const edited=JSON.parse(draft.draftRevision.document);assert.deepEqual(edited.blocks.map(b=>b.visuals),sections.map(b=>b.visuals));assert.deepEqual(edited.blocks.map(b=>b.preset),sections.map(b=>b.preset));
    await page.goto(`${base}/admin/posts/${post.id}/preview`,{waitUntil:'networkidle'});assert.ok(await page.locator('main#main').textContent().then(text=>text.includes('[isolated edit]')));
    await page.goto(`${base}/admin/posts/${post.id}`,{waitUntil:'networkidle'});await page.locator('[name="revisionId"]').selectOption(post.publishedRevisionId);await page.getByRole('button',{name:'ვერსიის მონახაზად აღდგენა',exact:true}).click();await page.waitForURL(/saved=1/);
    assert.equal(await page.locator('[data-preserved-field]').first().inputValue(),originalValue);
    assert.deepEqual(JSON.parse((await db.post.findUniqueOrThrow({where:{id:post.id},include:{draftRevision:true}})).draftRevision.document),JSON.parse(post.publishedRevision.document));
  }
  await page.goto(`${base}/admin/posts`,{waitUntil:'networkidle'});await page.screenshot({path:`${directory}/admin-article-list.png`,fullPage:true,style:'nextjs-portal {visibility:hidden!important}'});
  const anonymous=await browser.newContext();const unauth=await anonymous.newPage();await unauth.goto(`${base}/admin/article-preview/${posts[0].id}`);assert.match(unauth.url(),/\/admin\/login/);await anonymous.close();
  assert.deepEqual(errors,[]);await writeFile(`${directory}/report.json`,JSON.stringify({passed:true,results,errors,editedAndRestored:4,unauthorizedRedirect:true},null,2));
  console.log('12 exact content/geometry and raster preview comparisons passed; all 4 migrated bodies edited and restored through admin.');
} finally {
  await db.$transaction(async tx=>{for(const post of originalPosts){const {id,...data}=post;await tx.post.update({where:{id},data});}await tx.postRevision.deleteMany({where:{postId:{in:originalPosts.map(row=>row.id)},id:{notIn:originalRevisions}}});},{timeout:60000});
  await browser.close();await db.$disconnect();
}
