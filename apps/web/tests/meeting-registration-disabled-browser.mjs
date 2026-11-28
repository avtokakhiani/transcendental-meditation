/* global document, innerWidth */
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';
import { writeFile } from 'node:fs/promises';
import { URL } from 'node:url';
import process from 'node:process';
import console from 'node:console';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';

const base = process.env.MEETING_TEST_URL || 'http://localhost:31997';
assert(['localhost', '127.0.0.1'].includes(new URL(base).hostname), 'Local testing only');
process.loadEnvFile('.env');
assert.match(process.env.DATABASE_URL || '', /^sqlserver:\/\/(localhost|127\.0\.0\.1):1434;/i);
const notice = 'ამჟამად გაცნობითი შეხვედრები დაგეგმილი არ არის. გთხოვ, მოგვიანებით შემოგვიერთდე.';
const db = new PrismaClient({ log: [] });
let browser;
const report = { endpointCases: [], views: [], corporateUnchanged: false, meetingAdminPreserved: false, noJavaScriptFallback: false, clientErrors: [] };
try {
  // Only public slugs/page numbers and the local administrator ID are read. No
  // fixture inserts, saves, publication changes, login writes or notifications.
  const posts = await db.post.findMany({ where: { status: 'published' }, select: { slug: true } });
  const books = await db.book.findMany({ where: { status: 'published' }, select: { slug: true, pages: { select: { number: true } } } });
  const routes = [...new Set(['/', '/benefits', '/stress-and-anxiety', '/health', '/brain-function', '/relationships', '/peace', '/how-to-learn', '/blog', '/books', '/organizaciebitvis', '/about', '/faq', '/introductory-meeting', '/privacy-policy', '/terms-of-use',
    ...posts.map(post => `/blog/${post.slug}`), ...books.flatMap(book => [`/books/${book.slug}`, ...book.pages.map(page => `/books/${book.slug}/${page.number}`)])])];
  browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
  const context = await browser.newContext();
  const api = context.request;
  const availability = await api.get(`${base}/api/meetings`);
  assert.equal(availability.status(), 200);
  assert.deepEqual(await availability.json(), { meetings: [] });
  assert.equal(availability.headers()['cache-control'], 'no-store');
  const input = { meetingId: '11111111-1111-4111-8111-111111111111', firstName: 'Synthetic', lastName: 'Disabled', email: 'disabled@example.invalid', phone: '+995511111111' };
  for (const [name, options] of [
    ['valid-json', { headers: { Origin: base }, data: input }],
    ['invalid-json', { headers: { Origin: base, 'Content-Type': 'application/json' }, data: '{invalid' }],
    ['empty', { headers: { Origin: base }, data: {} }],
    ['no-origin', { data: input }],
    ['cross-origin', { headers: { Origin: 'https://untrusted.invalid' }, data: input }],
    ['form', { headers: { Origin: base }, form: { email: 'disabled@example.invalid' } }],
    ['oversized', { headers: { Origin: base, 'Content-Type': 'application/json' }, data: 'x'.repeat(10000) }],
  ]) {
    const response = await api.post(`${base}/api/meetings/register`, options);
    assert.equal(response.status(), 403, name);
    assert.equal(response.headers()['cache-control'], 'no-store');
    assert.deepEqual(await response.json(), { error: notice, code: 'MEETING_REGISTRATION_DISABLED' });
    report.endpointCases.push({ name, status: response.status(), noSuccess: true });
  }
  for (const method of ['GET', 'PUT', 'PATCH', 'DELETE']) {
    const response = await api.fetch(`${base}/api/meetings/register`, { method });
    assert.equal(response.status(), 405);
    report.endpointCases.push({ name: method, status: 405, noSuccess: true });
  }
  const trailing = await api.post(`${base}/api/meetings/register/`, { headers: { Origin: base }, data: input });
  assert.equal(trailing.status(), 403);
  assert.equal((await trailing.json()).code, 'MEETING_REGISTRATION_DISABLED');
  report.endpointCases.push({ name: 'trailing-slash', status: 403, noSuccess: true });
  // Corporate denials retain their existing validation rather than the new gate.
  const corporate = await api.post(`${base}/api/corporate-inquiries`, { headers: { Origin: base }, data: {} });
  assert.equal(corporate.status(), 400);
  assert.notEqual((await corporate.json()).code, 'MEETING_REGISTRATION_DISABLED');

  let meetingRequests = 0, corporateRequests = 0;
  context.on('request', request => { if (new URL(request.url()).pathname.startsWith('/api/meetings')) meetingRequests++; });
  await context.route('**/*', async route => {
    const request = route.request(), url = new URL(request.url());
    if (url.origin !== new URL(base).origin) return route.abort();
    if (request.method() !== 'GET' && request.method() !== 'HEAD') {
      if (url.pathname === '/api/corporate-inquiries') {
        corporateRequests++;
        return route.fulfill({ status: 503, json: { error: 'Synthetic delivery failure' } });
      }
      throw new Error('Unexpected page mutation blocked');
    }
    return route.continue();
  });
  const page = await context.newPage();
  page.setDefaultNavigationTimeout(90000); // Host development routes compile on first request.
  page.on('pageerror', error => report.clientErrors.push(error.message.slice(0, 160)));
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 900 });
    for (const route of routes) {
      const response = await page.goto(base + route, { waitUntil: 'networkidle' });
      assert.equal(response.status(), 200, route);
      assert.equal(new URL(page.url()).pathname, route);
      const cta = page.locator('header a[href="/introductory-meeting"]:visible').first();
      if (await cta.count() === 0 && !/^\/books\/[^/]+\/\d+$/.test(route)) {
        // At narrow widths the approved CTA lives inside the mobile menu.
        await page.locator('#site-mobile-menu-trigger').click();
        await cta.waitFor();
      }
      const panelPresent = await cta.count() > 0;
      if (panelPresent) {
        const returnFocusId = await cta.getAttribute('data-dialog-return-focus');
        const focusTarget = returnFocusId ? page.locator(`#${returnFocusId}`) : cta;
        await cta.focus(); await page.keyboard.press('Enter');
        const panel = page.locator('dialog[open]');
        await panel.waitFor();
        assert.equal(new URL(page.url()).pathname, route, 'Panel preserves current URL');
        assert.equal(await panel.getByRole('status').textContent(), notice);
        assert.equal(await panel.locator('form, input, time').count(), 0);
        assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
        assert.equal(await panel.getAttribute('aria-labelledby') !== null, true);
        await page.keyboard.press('Tab');
        assert.equal(await panel.evaluate(el => el.contains(document.activeElement)), true, 'Focus stays inside dialog');
        await page.keyboard.press('Escape');
        await panel.waitFor({ state: 'hidden' });
        assert.equal(await focusTarget.evaluate(el => el === document.activeElement), true);
        assert.equal(await page.evaluate(() => document.body.style.overflow), '');
      } else {
        // The existing full-screen reader intentionally has its own navigation.
        assert.match(route, /^\/books\/[^/]+\/\d+$/);
      }
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth + 2), false, route);
      if (route === '/introductory-meeting') {
        assert.equal(await page.locator('main').getByRole('status').textContent(), notice);
        assert.equal(await page.locator('main form').count(), 0);
      }
      report.views.push({ route, width, status: response.status(), panelEmptyAndKeyboardAccessible: panelPresent, readerWithoutSiteHeader: !panelPresent });
    }
    console.log(`Verified ${routes.length} public routes and disabled panels at ${width}px.`);
    await page.goto(`${base}/organizaciebitvis`);
    await page.locator('a[href="#corporate-contact"]').first().click();
    assert.equal(new URL(page.url()).hash, '#corporate-contact');
    assert.equal(await page.locator('dialog[open]').count(), 0);
    const form = page.locator('#corporate-contact form');
    assert.equal(await form.count(), 1);
    for (const [name, value] of Object.entries({ name: 'Synthetic Test', organization: 'Synthetic Organization', email: 'corporate@example.invalid', message: 'Synthetic local verification' })) await form.locator(`[name="${name}"]`).fill(value);
    await form.locator('button[type="submit"]').click();
    await form.getByRole('alert').waitFor();
    assert.equal(await form.locator('[name="email"]').inputValue(), 'corporate@example.invalid');
    assert.equal(await form.locator('button[type="submit"]').isEnabled(), true);
  }
  assert.equal(corporateRequests, 3);
  assert.equal(meetingRequests, 0, 'Unavailable UI neither fetches schedules nor submits contact data');
  report.corporateUnchanged = true;
  const anonymous = await api.get(`${base}/admin/meetings`, { maxRedirects: 0 });
  assert.equal(anonymous.status(), 307);
  const actor = await db.user.findFirstOrThrow({ where: { isActive: true, role: 'admin' }, select: { id: true } });
  const payload = Buffer.from(JSON.stringify({ userId: actor.id, expiresAt: Date.now() + 60000 })).toString('base64url');
  const signature = createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url');
  await context.addCookies([{ name: 'tm_session', value: `${payload}.${signature}`, url: base, httpOnly: true, sameSite: 'Lax' }]);
  assert.equal((await page.goto(`${base}/admin/meetings`)).status(), 200);
  assert.equal(new URL(page.url()).pathname, '/admin/meetings');
  assert.equal(await page.locator('input[name="startsAt"]').first().getAttribute('type'), 'datetime-local');
  assert.equal(await page.locator('select[name="status"]').first().inputValue(), 'draft');
  report.meetingAdminPreserved = true;
  const noJS = await browser.newContext({ javaScriptEnabled: false });
  await noJS.route('**/*', route => new URL(route.request().url()).origin === new URL(base).origin ? route.continue() : route.abort());
  const plain = await noJS.newPage();
  await plain.goto(base);
  await plain.locator('header a[href="/introductory-meeting"]:visible').first().click();
  assert.equal(new URL(plain.url()).pathname, '/introductory-meeting');
  assert.equal(await plain.locator('main').getByRole('status').textContent(), notice);
  assert.equal(await plain.locator('main form').count(), 0);
  report.noJavaScriptFallback = true;
  assert.deepEqual(report.clientErrors, []);
  if (process.env.MEETING_DISABLED_REPORT) await writeFile(process.env.MEETING_DISABLED_REPORT, JSON.stringify(report, null, 2));
  console.log(`Disabled registration passed: ${report.endpointCases.length} endpoint cases; ${report.views.length} page/panel checks; corporate, administration and no-JavaScript fallback preserved.`);
} finally {
  await browser?.close();
  await db.$disconnect();
}
