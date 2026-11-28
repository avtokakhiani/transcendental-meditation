/* global document, window, innerWidth, URL */
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHmac, randomUUID } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import process from 'node:process';
import console from 'node:console';
import { BlobServiceClient } from '@azure/storage-blob';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';

process.loadEnvFile('.env');
const base = 'http://localhost:31998';
const run=process.env.ARTICLE_BACKUP_RUN??'phase5-2026-11-24';
const backup = JSON.parse(await readFile(`private/article-foundation/${run}/backup.json`, 'utf8'));
assert.match(backup.restoredDatabase, /^article_foundation_restore_\d+$/);
const db = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL.replace(/database=[^;]+/, `database=${backup.restoredDatabase}`), log: [] });
const directory = `private/article-foundation/${run}/workflow`;
await mkdir(directory, { recursive: true });
const browser = await chromium.launch({ channel: 'chrome' });
let postId;
const initialMedia = new Set((await db.media.findMany({ select: { id: true } })).map(row => row.id));
const slug = `phase5-browser-${randomUUID()}`;
try {
  const actor = await db.user.findFirstOrThrow({ where: { role: 'admin', isActive: true } });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' });
  context.setDefaultNavigationTimeout(120000);
  const payload = Buffer.from(JSON.stringify({ userId: actor.id, expiresAt: Date.now() + 3600000 })).toString('base64url');
  const signature = createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url');
  await context.addCookies([{ name: 'tm_session', value: `${payload}.${signature}`, url: base, httpOnly: true, sameSite: 'Lax' }]);
  await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  page.on('dialog', dialog => dialog.accept());
  let actionRequest,visualRequest;
  page.on('request', request => { if (request.method() !== 'POST'||!request.headers()['next-action'])return;if(request.postData()?.includes('intent'))actionRequest=request;else if(request.postData()?.includes('componentId'))visualRequest=request; });
  assert.equal((await page.goto(`${base}/admin/posts/new`, { waitUntil: 'networkidle', timeout: 120000 })).status(), 200);
  await page.locator('.tiptap[contenteditable="true"]').waitFor();
  await page.locator('input[name="title"]').fill('სატესტო კვლევა — მხოლოდ იზოლირებულ ბაზაში');
  assert.equal(await page.locator('input[name="slug"]').inputValue(),'satesto-kvleva-mkholod-izolirebul-bazashi','Georgian title uses consistent Latin transliteration');
  await page.locator('input[name="slug"]').fill(slug);
  await page.locator('input[name="title"]').fill('სხვა ქართული სათაური');
  assert.equal(await page.locator('input[name="slug"]').inputValue(),slug,'Manual URL survives title edits');
  await page.locator('input[name="title"]').fill('სატესტო კვლევა — მხოლოდ იზოლირებულ ბაზაში');
  for (const [name, value] of Object.entries({ displayHeading: 'კვლევის ვრცელი სათაური', editorialByline: 'კვლევის ავტორი', category: 'სამეცნიერო კვლევები', excerpt: 'სტატიის მოკლე აღწერა.', cardTitle: 'კვლევის მოკლე სათაური', cardExcerpt: 'ბარათის მოკლე აღწერა.', seoTitle: 'კვლევის SEO სათაური', seoDescription: 'კვლევის SEO აღწერა.', coverImageAlt: 'ზღვის სანაპირო' })) await page.locator(`[name="${name}"]`).fill(value);
  const editor = page.locator('.tiptap').first();
  await editor.fill('ქართული და English ტექსტი.');
  await editor.press('Control+Home'); await editor.press('Control+Alt+2');
  await editor.press('End'); await editor.press('Enter'); await editor.pressSequentially('კვლევის განმარტება და წყაროები.');
  const proseBlock=page.locator('[data-article-block="prose"]').first();
  await editor.press('Enter');await proseBlock.getByRole('button',{name:'სია',exact:true}).click();await page.keyboard.type('პირველი პუნქტი');await page.keyboard.press('Enter');await page.keyboard.type('მეორე პუნქტი');await page.keyboard.press('Enter');await page.keyboard.press('Enter');
  await page.keyboard.type('წყაროს ბმული');await page.keyboard.press('Shift+Home');await proseBlock.getByRole('button',{name:'ბმული (Ctrl+K)',exact:true}).click();await proseBlock.locator('input[placeholder="https://"]').fill('https://example.invalid/editor-link');
  await proseBlock.getByRole('button',{name:'შენახვა',exact:true}).click();await editor.press('Control+End');await editor.press('Enter');
  await proseBlock.getByRole('button',{name:'ცხრილი',exact:true}).click();await proseBlock.getByRole('button',{name:'2 × 2',exact:true}).click();await editor.locator('table p').first().click();await page.keyboard.type('ცხრილის სათაური');
  await editor.locator('a[href="https://example.invalid/editor-link"]').waitFor();
  assert.equal(await editor.locator('ul li').count(),2);assert.equal(await editor.locator('table').count(),1);assert.equal(await editor.locator('a[href="https://example.invalid/editor-link"]').count(),1);
  await page.getByRole('button', { name: 'წყაროს დამატება', exact: true }).click();
  await page.getByLabel('წყაროს 1 სათაური', { exact: true }).fill('კვლევის პირველწყარო');
  await page.getByLabel('წყაროს ბმული', { exact: true }).fill('https://example.invalid/research');
  await page.getByLabel('ბიბლიოგრაფიული აღწერა', { exact: true }).fill('იზოლირებული ტესტის ბიბლიოგრაფიული ჩანაწერი');
  await page.getByRole('button', { name: 'კვლევის სექციის დამატება', exact: true }).click();
  const research = page.locator('[data-article-block="research"]');
  await research.locator('.tiptap').fill('კვლევის განმარტებითი ტექსტი.');
  await research.getByLabel('გრაფიკის ტექსტური აღწერა', { exact: true }).fill('არტერიული წნევის კვლევის აღწერა');
  await research.getByLabel('გრაფიკის მდებარეობა',{exact:true}).selectOption('left');
  await research.getByLabel('კომპონენტის სიგანე (%)',{exact:true}).fill('85');
  await research.locator('[data-component-preview] img').waitFor({timeout:120000});
  await research.getByLabel('წარწერა', { exact: true }).fill('არსებული დამტკიცებული SVG გრაფიკი');
  await research.getByRole('checkbox', { name: 'კვლევის პირველწყარო', exact: true }).check();
  await page.getByRole('button', { name: 'კომპონენტის დამატება', exact: true }).click();
  const component = page.locator('[data-article-block="component"]');
  await component.getByLabel('ვიზუალური კომპონენტი', { exact: true }).selectOption('research.comparison@1');
  await component.getByLabel('გრაფიკის სათაური', { exact: true }).fill('ინტერაქტიული შედარება');
  await component.getByLabel('საზომი ერთეული', { exact: true }).fill('%');
  for (let index = 0; index < 2; index++) {
    await component.getByRole('button', { name: 'მაჩვენებლის დამატება', exact: true }).click();
    await component.getByLabel(`მაჩვენებელი ${index + 1}`, { exact: true }).fill(`ჯგუფი ${index ? 'B' : 'A'}`);
    await component.getByLabel('მნიშვნელობა', { exact: true }).nth(index).fill(String(index ? 8 : 20));
  }
  // Incomplete component validation must retain the user's controlled text fields.
  await page.getByRole('button', { name: 'მონახაზის შენახვა', exact: true }).click();
  await page.getByRole('alert').waitFor();
  assert.equal(await page.locator('[name="displayHeading"]').inputValue(), 'კვლევის ვრცელი სათაური');
  assert.equal(await page.locator('input[name="title"]').inputValue(), 'სატესტო კვლევა — მხოლოდ იზოლირებულ ბაზაში');
  await component.getByLabel('გრაფიკის ტექსტური აღწერა', { exact: true }).fill('ორი ჯგუფის შედარება ხელმისაწვდომი ცხრილით');
  await component.locator('[data-component-preview] table').waitFor({timeout:120000});
  await component.getByRole('checkbox', { name: 'კვლევის პირველწყარო', exact: true }).check();
  const choose = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'სურათის ატვირთვა', exact: true }).click();
  await (await choose).setFiles('public/images/heart-article-hero-beach.jpeg');
  const figure = page.locator('[data-article-block="figure"]'); await figure.waitFor();
  await figure.getByLabel('ალტერნატიული ტექსტი', { exact: true }).fill('ზღვის სანაპიროს სურათი');
  await figure.getByLabel('წარწერა', { exact: true }).fill('სურათის წარწერა');
  await figure.getByLabel('ავტორი / უფლებების მითითება', { exact: true }).fill('სურათის ავტორი');
  await figure.getByLabel('სურათის წყაროს ბმული', { exact: true }).fill('https://example.invalid/image');
  await figure.getByLabel('სიგანე (%)', { exact: true }).fill('75');
  await figure.getByLabel('სურათის სიგანე (პიქსელი)',{exact:true}).fill('1200');await figure.getByLabel('სურათის სიმაღლე (პიქსელი)',{exact:true}).fill('800');
  await figure.getByLabel('სურათის განლაგება', { exact: true }).selectOption('left');
  const coverChooser = page.waitForEvent('filechooser');
  await page.getByRole('button', { name: 'ატვირთვა', exact: true }).click();
  await (await coverChooser).setFiles('public/images/heart-article-hero-beach.jpeg');
  await page.waitForFunction(() => document.querySelector('input[name="coverImageUrl"]').value.startsWith('/api/media/'));
  await page.locator('[name="coverCrop"]').selectOption('top');
  await page.getByRole('button', { name: 'წყაროს ჩასმა', exact: true }).click();
  await page.getByRole('button', { name: 'მონახაზის შენახვა', exact: true }).click();
  await page.waitForURL(/\/admin\/posts\/[0-9a-f-]+\?saved=1/, { timeout: 120000 });
  postId = /\/posts\/([^/?]+)/.exec(page.url())[1];
  await page.waitForLoadState('networkidle');
  const submit = async intent => {
    const version = await page.locator('[data-article-authoring] input[name="version"]').inputValue();
    await page.locator(`button[name="intent"][value="${intent}"]`).click();
    await page.waitForFunction(previous => document.querySelector('[data-article-authoring] input[name="version"]')?.value !== previous, version, { timeout: 60000 });
    await page.waitForLoadState('networkidle');
  };
  let post = await db.post.findUniqueOrThrow({ where: { id: postId } });
  assert.equal(post.status, 'draft'); assert.ok(post.draftRevisionId); assert.equal(post.publishedRevisionId, null);
  const firstDraft = post.draftRevisionId;
  const publicContext=await browser.newContext({viewport:{width:1440,height:1000},reducedMotion:'reduce'});
  publicContext.setDefaultNavigationTimeout(120000);
  await publicContext.route('**/*',route=>new URL(route.request().url()).origin===base?route.continue():route.abort());
  const publicPage=await publicContext.newPage();
  const publicChecks=[];
  const publicViews=async(live,forbidden)=>{
    const row=await db.post.findUniqueOrThrow({where:{id:postId},include:{publishedRevision:true}}),r=row.publishedRevision;
    const response=await publicPage.goto(`${base}/blog/${slug}`,{waitUntil:'networkidle'});
    assert.equal(response.status(),live?200:404);
    if(live){assert.equal(await publicPage.locator('h1').textContent(),r.displayHeading??r.title);assert.ok((await publicPage.title()).includes(r.seoTitle??r.title));assert.equal(await publicPage.locator('meta[name="description"]').getAttribute('content'),r.seoDescription??r.excerpt);assert.equal(await publicPage.locator('meta[property="og:title"]').getAttribute('content'),r.seoTitle??r.title);assert.equal(await publicPage.locator('figcaption').count()>0,true);assert.ok(await publicPage.locator('button[aria-pressed]').count());}
    if(forbidden)assert.ok(!(await response.text()).includes(forbidden),'Draft must not leak into HTML/RSC or metadata');
    for(const route of ['/blog','/','/blog/meditatsia-uketesi-dzilistvis']){
      const result=await publicPage.goto(base+route,{waitUntil:'networkidle'});
      const links=publicPage.locator(`main a[href="/blog/${slug}"]`);assert.equal(await links.count(),live?1:0,route);
      if(live&&route==='/'){const cards=publicPage.locator('section[aria-labelledby="latest-posts-heading"] a[href^="/blog/"]');assert.equal(await cards.first().getAttribute('href'),`/blog/${slug}`);}
      if(live&&route==='/blog'){assert.ok((await links.textContent()).includes(r.cardTitle??r.title));assert.ok((await links.textContent()).includes(r.cardExcerpt??r.excerpt));}
      if(forbidden)assert.ok(!(await result.text()).includes(forbidden),'Draft must not leak into listings or recommendations');
    }
    publicChecks.push({live,forbiddenChecked:Boolean(forbidden),revision:r?.id??null});
  };
  await publicViews(false);
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.evaluate(() => document.fonts.ready);
    await page.mouse.move(0, 0);
    await page.screenshot({ path: `${directory}/editor-${width}.png`, fullPage: true, animations: 'disabled', style: 'nextjs-portal { visibility: hidden !important; }' });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `Editor overflow at ${width}`);
    for(const position of ['top','middle','bottom']){
      await page.evaluate(position=>window.scrollTo(0,position==='top'?0:position==='middle'?document.documentElement.scrollHeight/2:document.documentElement.scrollHeight),position);
      const bar=await page.locator('[data-article-actions]').boundingBox();assert.ok(bar&&bar.y>=0&&bar.y+bar.height<=1001,`Actions visible at ${width}/${position}`);
    }
    await page.evaluate(()=>window.scrollTo(0,0));await page.screenshot({path:`${directory}/editor-viewport-${width}.png`,animations:'disabled',style:'nextjs-portal {visibility:hidden!important}'});
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  const preview = await context.newPage();
  const previewUrl = `${base}/admin/posts/${postId}/preview`;
  const previewResponse = await preview.goto(previewUrl, { waitUntil: 'networkidle', timeout: 120000 });
  assert.equal(previewResponse.status(), 200);
  // Next.js development mode overrides configured Cache-Control with the stronger no-store.
  assert.match(previewResponse.headers()['cache-control'], /no-store/);
  assert.ok(!/(^|,)\s*public\b/.test(previewResponse.headers()['cache-control']));
  assert.match(previewResponse.headers()['x-robots-tag'], /noindex/);
  await preview.getByRole('heading', { name: 'კვლევის ვრცელი სათაური', exact: true }).waitFor();
  assert.equal(await preview.locator('figcaption').filter({ hasText: 'სურათის წარწერა' }).count(), 1);
  assert.equal(await preview.locator('a[href="#source-' + JSON.parse((await db.postRevision.findUniqueOrThrow({ where: { id: firstDraft } })).document).sources[0].id + '"]').count() > 0, true);
  const toggle = preview.locator('button[aria-pressed]').first(); await toggle.click(); assert.equal(await toggle.getAttribute('aria-pressed'), 'true');
  for (const width of [1440, 768, 390]) { await preview.setViewportSize({ width, height: 1000 }); await preview.screenshot({ path: `${directory}/preview-${width}.png`, fullPage: true, animations: 'disabled', style: 'nextjs-portal { visibility: hidden !important; }' }); assert.ok(await preview.evaluate(() => document.documentElement.scrollWidth <= innerWidth)); }
  const anonymous = await browser.newContext();
  const denied = await anonymous.request.get(previewUrl, { maxRedirects: 0 });
  assert.ok([303, 307].includes(denied.status())); assert.match(denied.headers().location, /admin\/login/);
  const intro = await db.post.findUniqueOrThrow({ where: { slug: 'ra-aris-transtsendentuli-meditatsia' } });
  assert.equal((await context.request.get(`${previewUrl}?revision=${intro.draftRevisionId}`)).status(), 404);
  await preview.close();
  const stale = await context.newPage();
  await stale.goto(page.url(), { waitUntil: 'networkidle' });
  await page.locator('[name="displayHeading"]').fill('ახალი მონახაზის სათაური');
  await submit('save');
  await stale.locator('[name="displayHeading"]').fill('კონკურენტული ცვლილება');
  await stale.getByRole('button', { name: 'მონახაზის შენახვა', exact: true }).click();
  await stale.getByRole('alert').filter({ hasText: 'სხვა ფანჯარაში' }).waitFor();
  assert.equal(await stale.locator('[name="displayHeading"]').inputValue(), 'კონკურენტული ცვლილება');
  await stale.close();
  const previous = post;
  await submit('publish');
  await page.getByText('სტატია გამოქვეყნებულია.', { exact: false }).waitFor();
  post = await db.post.findUniqueOrThrow({ where: { id: postId } });
  assert.equal(post.status, 'published'); assert.ok(post.publishedAt); assert.notEqual(post.publishedRevisionId, previous.draftRevisionId);
  await publicViews(true);
  await publicPage.goto(`${base}/blog/${slug}`,{waitUntil:'networkidle'});
  for(const width of [1440,768,390]){await publicPage.setViewportSize({width,height:1000});await publicPage.evaluate(()=>document.fonts.ready);await publicPage.screenshot({path:`${directory}/public-${width}.png`,fullPage:true,animations:'disabled',style:'nextjs-portal {visibility:hidden!important}'});assert.ok(await publicPage.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));}
  await publicPage.setViewportSize({width:1440,height:1000});
  const publishedAt = post.publishedAt.toISOString(), publishedId = post.publishedRevisionId, publishedContent = post.content;
  await page.locator('[name="displayHeading"]').fill('PHASE5_PRIVATE_DRAFT_NEVER_PUBLIC');
  await page.locator('[name="seoTitle"]').fill('PHASE5_PRIVATE_DRAFT_NEVER_PUBLIC');
  await page.locator('[name="cardTitle"]').fill('PHASE5_PRIVATE_DRAFT_NEVER_PUBLIC');
  await page.locator('.tiptap').first().fill('PHASE5_PRIVATE_DRAFT_NEVER_PUBLIC');
  await submit('save');
  assert.equal((await db.post.findUniqueOrThrow({ where: { id: postId } })).content, publishedContent);
  assert.equal((await db.post.findUniqueOrThrow({ where: { id: postId } })).publishedRevisionId, publishedId);
  await publicViews(true,'PHASE5_PRIVATE_DRAFT_NEVER_PUBLIC');
  await submit('publish');await publicViews(true);
  assert.equal((await db.post.findUniqueOrThrow({where:{id:postId}})).publishedAt.toISOString(),publishedAt);
  await page.locator('[name="revisionId"]').selectOption(firstDraft);
  await submit('restore');
  assert.equal(await page.locator('[name="displayHeading"]').inputValue(), 'კვლევის ვრცელი სათაური');
  await publicViews(true);
  await submit('publish');await publicViews(true,'PHASE5_PRIVATE_DRAFT_NEVER_PUBLIC');
  const alias=`phase5-alias-${randomUUID()}`;
  await page.locator('[name="aliasSlug"]').fill(alias);await submit('alias');
  const redirect=await publicContext.request.get(`${base}/blog/${alias}`,{maxRedirects:0});assert.equal(redirect.status(),308);assert.equal(redirect.headers().location,`/blog/${slug}`);
  await publicPage.goto(`${base}/blog/${alias}`,{waitUntil:'networkidle'});assert.equal(new URL(publicPage.url()).pathname,`/blog/${slug}`);
  await submit('unpublish');
  assert.equal((await db.post.findUniqueOrThrow({ where: { id: postId } })).status, 'draft');
  await publicViews(false);assert.equal((await publicContext.request.get(`${base}/blog/${alias}`,{maxRedirects:0})).status(),404);
  await submit('publish'); await page.getByText('სტატია გამოქვეყნებულია.', { exact: false }).waitFor();
  assert.equal((await db.post.findUniqueOrThrow({ where: { id: postId } })).publishedAt.toISOString(), publishedAt);
  await publicViews(true);
  assert.equal((await publicContext.request.get(`${base}/blog/${alias}`,{maxRedirects:0})).status(),308);
  const count = await db.postRevision.count({ where: { postId } });
  assert.ok(actionRequest);
  const headers = { ...actionRequest.headers(), origin: base }; delete headers.cookie;
  await anonymous.request.post(page.url(), { headers, data: actionRequest.postDataBuffer(), maxRedirects: 0 });
  assert.equal(await db.postRevision.count({ where: { postId } }), count, 'Anonymous Server Action replay cannot mutate revisions');
  assert.ok(visualRequest);const visualHeaders={...visualRequest.headers(),origin:base};delete visualHeaders.cookie;
  const unauthorizedVisual=await anonymous.request.post(page.url(),{headers:visualHeaders,data:visualRequest.postDataBuffer(),maxRedirects:0});assert.ok(!(await unauthorizedVisual.text()).includes('<svg'),'Anonymous visual preview cannot render component content');
  assert.deepEqual(errors, []);
  await writeFile(`${directory}/report.json`, JSON.stringify({ passed: true, previewHeaders: { cacheControl: previewResponse.headers()['cache-control'], robots: previewResponse.headers()['x-robots-tag'] }, revisionsExercised: count, screenshots: ['editor', 'preview'].flatMap(prefix => [1440, 768, 390].map(width => `${prefix}-${width}.png`)), checks: ['UI authoring', 'validation retains input', 'real upload', 'SVG and interactive components', 'citations', 'private preview', 'cross-post revision rejection', 'concurrent tabs', 'published snapshot isolation', 'restore', 'unpublish and republish date', 'anonymous action replay'] }, null, 2));
  await writeFile(`${directory}/public-report.json`,JSON.stringify({passed:true,publicChecks,alias308:true,unpublishedAlias404:true,publicationDatePreserved:true,adminOnlyAuthoring:true},null,2));
  console.log('Admin-only authoring, public delivery, draft isolation, replacement publication, restoration, unpublishing, alias 308/404, metadata and recommendations passed.');
} finally {
  if (postId) await db.post.delete({ where: { id: postId } });
  else await db.post.deleteMany({ where: { slug } });
  const addedMedia = (await db.media.findMany()).filter(row => !initialMedia.has(row.id));
  const blobs = BlobServiceClient.fromConnectionString(process.env.AZURE_STORAGE_CONNECTION_STRING).getContainerClient(process.env.AZURE_STORAGE_CONTAINER || 'media');
  for (const media of addedMedia) { await blobs.getBlobClient(media.blobName).deleteIfExists(); await db.media.delete({ where: { id: media.id } }); }
  await browser.close(); await db.$disconnect();
}
