/* global document */
import assert from 'node:assert/strict';
import {Buffer} from 'node:buffer';
import {createHmac} from 'node:crypto';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import {URL} from 'node:url';
import {chromium} from 'playwright';
import {artifacts, db, json, snapshot} from './local.mjs';
const browser=await chromium.launch({channel:'chrome'}),base='http://localhost:31997';
try{
  const before=await snapshot(),actor=await db.user.findFirstOrThrow({where:{role:'admin',isActive:true}});
  const payload=Buffer.from(JSON.stringify({userId:actor.id,expiresAt:Date.now()+3600000})).toString('base64url');
  const context=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  context.setDefaultNavigationTimeout(120000);
  await context.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
  await context.addCookies([{name:'tm_session',value:`${payload}.${createHmac('sha256',process.env.AUTH_SECRET).update(payload).digest('base64url')}`,url:base,httpOnly:true,sameSite:'Lax'}]);
  const page=await context.newPage(),errors=[];page.on('pageerror',error=>errors.push(error.message));
  assert.equal((await page.goto(`${base}/admin/posts`,{waitUntil:'networkidle',timeout:120000})).status(),200);
  const posts=await db.post.findMany({include:{draftRevision:true}});assert.equal(posts.length,4);
  for(const post of posts)assert.ok((await page.locator('main').textContent()).includes(post.title));
  await page.screenshot({path:path.join(artifacts,'previews/admin-article-list-localhost.png'),fullPage:true,style:'nextjs-portal {visibility:hidden!important}'});
  for(const post of posts){
    assert.equal((await page.goto(`${base}/admin/posts/${post.id}`,{waitUntil:'networkidle'})).status(),200);
    assert.equal(await page.locator('[data-preserved-section]').count(),JSON.parse(post.draftRevision.document).blocks.length);
    if(post.kind==='evergreen')await page.screenshot({path:path.join(artifacts,'previews/introduction-editor-localhost.png'),fullPage:true,style:'nextjs-portal {visibility:hidden!important}'});
    const response=await page.goto(`${base}/admin/posts/${post.id}/preview`,{waitUntil:'networkidle'});
    assert.equal(response.status(),200);assert.match(response.headers()['cache-control'],/no-store/);assert.match(page.url(),/\/admin\/article-preview\//);assert.ok(await page.locator('main#main h1').count());
  }
  await page.evaluate(()=>document.fonts.ready);assert.deepEqual(errors,[]);assert.deepEqual(await snapshot(),before,'Read-only smoke must not change working records');
  await json(path.join(artifacts,'localhost-smoke.json'),{passed:true,allFourAdminEditorsAndPreviewsServed:true,workingRecordsUnchanged:true,errors});
  console.log('Localhost serves all four migrated editors and private previews; read-only smoke left every record unchanged.');
}finally{await browser.close();await db.$disconnect();}
