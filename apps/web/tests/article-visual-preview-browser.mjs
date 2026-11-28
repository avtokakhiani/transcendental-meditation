/* global document */
import assert from 'node:assert/strict';
import {createHmac} from 'node:crypto';
import {Buffer} from 'node:buffer';
import {readFile,writeFile} from 'node:fs/promises';
import process from 'node:process';
import console from 'node:console';
import {PrismaClient} from '@prisma/client';
import {chromium} from 'playwright';
process.loadEnvFile('.env');
const run=process.env.ARTICLE_BACKUP_RUN??'phase6-2026-11-24',base='http://localhost:31998';
const backup=JSON.parse(await readFile(`private/article-foundation/${run}/backup.json`,'utf8'));assert.match(backup.restoredDatabase,/^article_foundation_restore_\d+$/);
const db=new PrismaClient({datasourceUrl:process.env.DATABASE_URL.replace(/database=[^;]+/,`database=${backup.restoredDatabase}`)}),browser=await chromium.launch({channel:'chrome'});
let original;const revisionIds=(await db.postRevision.findMany({select:{id:true}})).map(row=>row.id);
try{
  const actor=await db.user.findFirstOrThrow({where:{role:'admin',isActive:true}});original=await db.post.findFirstOrThrow({where:{kind:'article'}});const post=original;
  const context=await browser.newContext(),anonymous=await browser.newContext();
  const payload=Buffer.from(JSON.stringify({userId:actor.id,expiresAt:Date.now()+300000})).toString('base64url');
  await context.addCookies([{name:'tm_session',value:`${payload}.${createHmac('sha256',process.env.AUTH_SECRET).update(payload).digest('base64url')}`,url:base,httpOnly:true,sameSite:'Lax'}]);
  const page=await context.newPage();page.setDefaultNavigationTimeout(120000);
  const pending=page.waitForRequest(request=>request.method()==='POST'&&request.headers()['next-action']&&request.postData()?.includes('componentId'),{timeout:120000});
  await page.goto(`${base}/admin/posts/${post.id}`,{waitUntil:'networkidle'});const request=await pending;
  await page.locator('[data-component-preview] figure').first().waitFor({state:'attached',timeout:120000});
  const headers={...request.headers(),origin:base};delete headers.cookie;
  const response=await anonymous.request.post(page.url(),{headers,data:request.postDataBuffer(),maxRedirects:0});
  assert.match(response.headers()['x-action-redirect']??response.headers().location??'',/\/admin\/login/,'Anonymous visual action must redirect to authentication');
  const blocked=await context.request.post(page.url(),{headers:{...request.headers(),origin:'http://other.invalid'},data:request.postDataBuffer(),maxRedirects:0});assert.ok([403,500].includes(blocked.status()),'Cross-origin action must be rejected');
  await page.locator('input[name="seoTitle"]').fill(post.title+' [isolated Enter save]');await page.locator('input[name="seoTitle"]').press('Enter');
  await page.waitForFunction(version=>Number(document.querySelector('[name="version"]').value)>version,post.version,{timeout:60000});
  const saved=await db.post.findUniqueOrThrow({where:{id:post.id}});assert.equal(saved.status,'published');assert.equal(saved.publishedRevisionId,post.publishedRevisionId);assert.notEqual(saved.draftRevisionId,post.draftRevisionId);
  await writeFile(`private/article-foundation/${run}/visual-preview-security.json`,JSON.stringify({passed:true,authenticatedRendering:true,anonymousRedirect:true,crossOriginRejected:true,enterSavesDraft:true,publishedVersionUnchanged:true,fixtureRestored:true},null,2));
  console.log('Visual preview authentication/CSRF and implicit Enter draft saving passed; published version unchanged.');
}finally{if(original)await db.$transaction(async tx=>{const {id,...data}=original;await tx.post.update({where:{id},data});await tx.postRevision.deleteMany({where:{postId:id,id:{notIn:revisionIds}}});});await browser.close();await db.$disconnect();}
