/* global process, console, URL */
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';

process.loadEnvFile('.env');
const base = 'http://localhost:31997';
const db = new PrismaClient({ log: [] });
const browser = await chromium.launch({ channel: 'chrome' });
const homeFile = 'src/app/(site)/page.tsx';
const original = await readFile(homeFile);
let sourceChanged = false;

try {
  const admin = await db.user.findFirst({ where: { role: 'admin', isActive: true }, select: { id: true } });
  assert.ok(admin, 'Requires an existing administrator; never creates database fixtures.');
  const context = await browser.newContext();
  const payload = Buffer.from(JSON.stringify({ userId: admin.id, expiresAt: Date.now() + 300000 })).toString('base64url');
  const signed = `${payload}.${createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url')}`;
  await context.addCookies([{ name: 'tm_session', value: signed, url: base, httpOnly: true, sameSite: 'Lax' }]);
  const anonymous = await browser.newContext();
  const records = [];
  for (const [path, browserContext] of [
    ['/', context], ['/how-to-learn', context], ['/about', context],
    ['/admin/posts', context], ['/admin/calendar-test', context], ['/admin/login', anonymous],
  ]) {
    const page = await browserContext.newPage();
    const record = { path, page, navigations: 0, documents: 0, rscRequests: 0, hmrConnected: false, reloadMessages: 0, runtimeErrors: 0, baseline: null };
    page.on('framenavigated', frame => { if (frame === page.mainFrame()) record.navigations++; });
    page.on('request', request => {
      const url = new URL(request.url());
      if (url.origin !== base) return;
      if (request.isNavigationRequest() && request.frame() === page.mainFrame()) record.documents++;
      if (url.searchParams.has('_rsc')) record.rscRequests++;
    });
    page.on('pageerror', () => record.runtimeErrors++);
    page.on('websocket', socket => socket.on('framereceived', event => {
      try {
        const message = JSON.parse(String(event.payload));
        if (message.type === 'turbopack-connected') record.hmrConnected = true;
        if (message.type === 'reloadPage') record.reloadMessages++;
      } catch { /* Ignore non-JSON frames; never print raw HMR traffic. */ }
    }));
    const response = await page.goto(`${base}${path}`);
    assert.equal(response.status(), 200, `${path}: HTTP 200`);
    await page.locator('main').waitFor();
    records.push(record);
  }
  // Finish lazy compilation before measuring an idle page with no source edits.
  await delay(3000);
  for (const record of records) record.baseline = { navigations: record.navigations, documents: record.documents, rscRequests: record.rscRequests, reloadMessages: record.reloadMessages };
  await delay(20000);
  for (const record of records) {
    assert.ok(record.hmrConnected, `${record.path}: Turbopack HMR must remain connected`);
    assert.equal(record.navigations, record.baseline.navigations, `${record.path}: no automatic full-page navigation`);
    assert.equal(record.documents, record.baseline.documents, `${record.path}: no automatic document requests`);
    assert.equal(record.rscRequests, record.baseline.rscRequests, `${record.path}: no automatic RSC navigation loop`);
    assert.equal(record.reloadMessages, record.baseline.reloadMessages, `${record.path}: no HMR reload commands`);
    assert.equal(record.runtimeErrors, 0, `${record.path}: no browser runtime errors`);
    console.log(`${record.path}: stable for 20s; no reloads or RSC loop; HMR connected.`);
  }

  // A reversible hidden DOM marker proves HMR actually applies source changes.
  // Restore the exact original bytes even if verification fails.
  const source = original.toString('utf8');
  const anchor = '      <Hero />';
  assert.equal(source.split(anchor).length, 2, 'Unique homepage probe location');
  sourceChanged = true;
  await writeFile(homeFile, source.replace(anchor, `      <span hidden data-dev-hmr-probe="verified" />\n${anchor}`));
  const home = records[0];
  await home.page.locator('[data-dev-hmr-probe="verified"]').waitFor({ state: 'attached', timeout: 30000 });
  assert.equal(home.documents, home.baseline.documents, 'HMR updates the homepage without a full document reload');
  await writeFile(homeFile, original);
  sourceChanged = false;
  await home.page.locator('[data-dev-hmr-probe]').waitFor({ state: 'detached', timeout: 30000 });
  console.log('Real source edit and exact restoration applied through HMR without a full-page reload.');
  const restoredBaselines = records.map(record => record.navigations);
  await delay(10000);
  records.forEach((record, index) => assert.equal(record.navigations, restoredBaselines[index], `${record.path}: remains stable after HMR`));
  assert.ok((await readFile(homeFile)).equals(original), 'Homepage source restored byte for byte');
} finally {
  if (sourceChanged) await writeFile(homeFile, original);
  await browser.close();
  await db.$disconnect();
}
