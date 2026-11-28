/* global document, window, location, getComputedStyle, innerWidth, createImageBitmap, OffscreenCanvas, fetch, URL */
import assert from 'node:assert/strict';
import console from 'node:console';
import process from 'node:process';
import { readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { chromium } from 'playwright';
import { articles } from './archive/article-catalog.ts';
import { getArticleCardCopy } from './archive/article-card-copy.ts';
import { artifacts, db, files, hash, json, sourceInventory, reviewedSourceChanges, web } from './local.mjs';

const mode = process.argv[2];
const statesOnly = process.argv.includes('--states-only');
const faqOnly = process.argv.includes('--faq-only');
const articlesOnly = process.argv.includes('--articles-only');
const resume = process.argv.includes('--resume');
assert.ok(!resume || mode === 'after', 'Only verified after captures can be resumed');
const routeFilter = process.argv.find(value => value.startsWith('--route='))?.slice(8);
const widthFilter = Number(process.argv.find(value => value.startsWith('--width='))?.slice(8)) || null;
assert.ok(['before', 'after'].includes(mode), 'Use before or after');
const base = process.env.FOUNDATION_BASE_URL ?? 'http://localhost:31997';
assert.match(base,/^http:\/\/localhost:3199[78]$/,'Capture local development servers only');
const output = path.join(artifacts, mode);
const widths = [1440, 768, 390];
const browser = await chromium.launch({ channel: 'chrome' });
const report = { pages: [], comparisons: [], errors: [] };
const manifestPath = path.join(artifacts, 'inventory.json');
const name = route => route === '/' ? 'home' : route.slice(1).replaceAll('/', '__');

async function settle(page, scroll = true) {
  await page.evaluate(() => document.fonts.ready);
  if (scroll) {
    await page.evaluate(async () => {
      for (let y = 0; y < document.documentElement.scrollHeight; y += 700) {
        window.scrollTo(0, y);
        await new Promise(resolve => window.setTimeout(resolve, 40));
      }
      window.scrollTo(0, 0);
    });
  }
  await page.evaluate(async () => {
    await Promise.all([...document.images].map(image => image.decode().catch(() => {})));
    window.scrollTo(0, 0);
  });
  await page.waitForTimeout(400);
}

async function screenshot(page, key, fullPage = true) {
  const file = `${key}.png`;
  // Only the Next.js development indicator is excluded, never application content.
  const bytes = await page.screenshot({ fullPage, animations: 'disabled', caret: 'hide', style: 'nextjs-portal { visibility: hidden !important; }' });
  await writeFile(path.join(output, file), bytes);
  if (mode !== 'after') return;
  const original = await readFile(path.join(artifacts, 'before', file));
  if (hash(original) === hash(bytes)) { report.comparisons.push({ file, differentPixels: 0 }); return; }
  const comparePage = await browser.newPage();
  try {
    const comparison = await comparePage.evaluate(async ([a, b]) => {
      const load = async data => {
        const image = await createImageBitmap(await (await fetch(`data:image/png;base64,${data}`)).blob());
        const canvas = new OffscreenCanvas(image.width, image.height);
        const ctx = canvas.getContext('2d'); ctx.drawImage(image, 0, 0);
        return { width: image.width, height: image.height, pixels: ctx.getImageData(0, 0, image.width, image.height).data };
      };
      const [left, right] = await Promise.all([load(a), load(b)]);
      if (left.width !== right.width || left.height !== right.height) return { dimensionsChanged: true, before: [left.width, left.height], after: [right.width, right.height] };
      let differentPixels = 0;
      for (let i = 0; i < left.pixels.length; i += 4) if ([0, 1, 2, 3].some(n => left.pixels[i + n] !== right.pixels[i + n])) differentPixels++;
      return { differentPixels, totalPixels: left.width * left.height };
    }, [original.toString('base64'), bytes.toString('base64')]);
    report.comparisons.push({ file, ...comparison });
  } finally { await comparePage.close(); }
}

async function capture(page, route, width) {
  const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 120000 });
  assert.equal(response.status(), 200, route);
  await settle(page);
  const inventory = await page.evaluate(() => ({
    path: location.pathname, title: document.title,
    canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null,
    metadata: [...document.head.querySelectorAll('meta[name],meta[property]')].map(el => Object.fromEntries([...el.attributes].map(a => [a.name, a.value]))),
    headings: [...document.querySelectorAll('h1,h2,h3,h4')].map(el => ({ level: el.tagName, text: el.textContent })),
    text: document.body.innerText,
    links: [...document.querySelectorAll('a[href]')].map(el => ({ href: el.getAttribute('href'), text: el.textContent, target: el.getAttribute('target'), rel: el.getAttribute('rel') })),
    images: [...document.images].map(el => ({ src: el.getAttribute('src'), srcset: el.getAttribute('srcset'), alt: el.alt, width: el.width, height: el.height, naturalWidth: el.naturalWidth, naturalHeight: el.naturalHeight, objectFit: getComputedStyle(el).objectFit, objectPosition: getComputedStyle(el).objectPosition, box: el.getBoundingClientRect().toJSON() })),
    svg: [...document.querySelectorAll('svg')].map(el => ({ viewBox: el.getAttribute('viewBox'), box: el.getBoundingClientRect().toJSON(), text: el.textContent })),
    overflow: document.documentElement.scrollWidth > innerWidth,
  }));
  // Development overlay text is excluded from editorial content comparison.
  inventory.text = await page.locator('body').evaluate(el => [...el.children].filter(child => child.tagName !== 'NEXTJS-PORTAL' && child.tagName !== 'SCRIPT').map(child => child.innerText ?? '').join('\n'));
  const key = `${name(route)}-${width}`;
  await json(path.join(output, `${key}.json`), inventory);
  await screenshot(page, key);
  if (mode === 'after') {
    const previous = JSON.parse(await readFile(path.join(artifacts, 'before', `${key}.json`), 'utf8'));
    if (JSON.stringify(previous) !== JSON.stringify(inventory)) report.errors.push(`${key}: DOM/content/metadata/layout inventory changed`);
  }
  report.pages.push({ route, width, status: response.status(), robots: response.headers()['x-robots-tag'], canonical: inventory.canonical, overflow: inventory.overflow, brokenImages: inventory.images.filter(img => !img.naturalWidth).map(img => img.src) });
}

try {
  await mkdir(output, { recursive: true });
  let manifest;
  if (mode === 'before' && !statesOnly && !faqOnly && !routeFilter) {
    await assert.rejects(readFile(manifestPath), { code: 'ENOENT' }, 'Never overwrite the original baseline');
    const posts = await db.post.findMany({ where: { status: 'published', publishedAt: { lte: new Date() } }, select: { slug: true } });
    const books = await db.book.findMany({ where: { status: 'published', publishedAt: { lte: new Date() } }, include: { pages: { where: { status: 'published' }, orderBy: { number: 'asc' } } } });
    const staticRoutes = (await files(path.join(web, 'src/app'))).filter(file => file.endsWith(`${path.sep}page.tsx`) && /\((site|reader)\)/.test(file) && !file.includes('[')).map(file => '/' + path.relative(path.join(web, 'src/app'), path.dirname(file)).split(path.sep).filter(part => !part.startsWith('(')).join('/'));
    const routes = [...new Set([...staticRoutes, ...posts.map(post => `/blog/${post.slug}`), ...articles.map(article => `/blog/${article.slug}`), ...books.flatMap(book => [`/books/${book.slug}`, ...book.pages.map(page => `/books/${book.slug}/${page.number}`)])])].sort();
    manifest = { createdAt: new Date().toISOString(), base, widths, routes, catalog: articles.map(article => ({ ...article, cardCopy: getArticleCardCopy(article.slug) })), sources: await sourceInventory(), notes: ['Canonical tags are recorded as found; none are invented.', 'No standalone Ayurveda route exists in this checkout; all existing public routes and assets are covered.', 'Every published reader page URL is included.'] };
    await json(manifestPath, manifest);
  } else manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
  if (routeFilter) assert.ok(manifest.routes.includes(routeFilter));
  for (const width of widths) {
    if (widthFilter && width !== widthFilter) continue;
    const context = await browser.newContext({ viewport: { width, height: 1000 }, reducedMotion: 'reduce', timezoneId: 'Asia/Tbilisi', locale: 'en-US', deviceScaleFactor: 1 });
    // External services never receive test traffic. Local application requests remain real.
    await context.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
    const page = await context.newPage();
    page.on('pageerror', error => report.errors.push(`${width}: ${error.message}`));
    for (const route of statesOnly || faqOnly ? [] : routeFilter ? [routeFilter] : articlesOnly ? manifest.routes.filter(route=>route==='/'||route==='/blog'||route.startsWith('/blog/')) : manifest.routes) {
      if (resume) {
        const key = `${name(route)}-${width}`;
        try {
          const [previous, captured] = await Promise.all([readFile(path.join(artifacts, 'before', `${key}.json`)), readFile(path.join(output, `${key}.json`))]);
          await readFile(path.join(output, `${key}.png`));
          if (hash(previous) === hash(captured)) { report.pages.push({route, width, reusedVerifiedInventory: true}); console.log(`resumed: ${width} ${route}`); continue; }
        } catch (error) { if (error.code !== 'ENOENT') throw error; }
      }
      await capture(page, route, width);
      console.log(`${mode}: ${width} ${route}`);
    }
    if (routeFilter || articlesOnly) { await context.close(); continue; }
    if (faqOnly) {
      await page.goto(`${base}/faq`, { waitUntil: 'networkidle' }); await settle(page);
      const summary = page.locator('main details summary').first();
      await summary.click();
      // Match the pointer states recorded in the original baseline for each viewport.
      if (width < 1024) await summary.hover(); else await page.mouse.move(0, 0);
      await page.waitForTimeout(300);
      await screenshot(page, `faq-open-${width}`);
      await context.close();
      continue;
    }
    // Shared interactive states, with real local content and no form submissions.
    await page.goto(base, { waitUntil: 'networkidle' }); await settle(page);
    if (width < 1024) {
      await page.getByRole('button', { name: 'მენიუს გახსნა', exact: true }).click();
      await page.waitForTimeout(250); await screenshot(page, `navigation-${width}`, false);
      await page.getByRole('button', { name: 'მენიუს დახურვა', exact: true }).click();
    } else {
      await page.getByRole('button', { name: 'რატომ TM?', exact: true }).click();
      await screenshot(page, `navigation-${width}`, false); await page.keyboard.press('Escape');
    }
    for (const [href, selector, key] of [
      ['/introductory-meeting', 'dialog[open]', 'registration'],
      ['/terms-of-use', 'dialog[data-legal-document="terms"][open]', 'terms'],
      ['/privacy-policy', 'dialog[data-legal-document="privacy"][open]', 'privacy'],
    ]) {
      await page.locator(`footer a[href="${href}"]`).click();
      await page.locator(selector).waitFor(); await settle(page, false);
      await screenshot(page, `${key}-${width}`, false);
      await page.keyboard.press('Escape'); await page.locator(selector).waitFor({ state: 'hidden' });
    }
    await page.goto(`${base}/faq`, { waitUntil: 'networkidle' }); await settle(page);
    const faq = page.locator('main details summary, main button[aria-expanded]').first();
    if (await faq.count()) {
      await faq.click();
      if (width < 1024) await faq.hover(); else await page.mouse.move(0, 0);
      await page.waitForTimeout(300); await screenshot(page, `faq-open-${width}`);
    }
    await context.close();
  }
  if (mode === 'after') {
    const current = await sourceInventory();
    const reviewed = await reviewedSourceChanges();
    for (const [file, digest] of Object.entries(manifest.sources)) if (current[file] !== digest && (!Object.hasOwn(reviewed,file)||(current[file]??null)!==reviewed[file])) report.errors.push(`Unreviewed source/asset changed: ${file}`);
    // Raw pixel differences are retained for the separate compare.mjs raster/DOM/source gate.
    for (const comparison of report.comparisons) if (comparison.dimensionsChanged) report.errors.push(`Screenshot dimensions changed: ${comparison.file}`);
  }
  await json(path.join(output, routeFilter ? 'targeted-report.json' : faqOnly ? 'faq-report.json' : statesOnly ? 'states-report.json' : 'report.json'), report);
  assert.deepEqual(report.errors, [], 'See private baseline report for failures');
  console.log(`${mode}: ${report.pages.length} responsive page captures; ${report.comparisons.length} comparisons; no errors.`);
} finally { await browser.close(); await db.$disconnect(); }
