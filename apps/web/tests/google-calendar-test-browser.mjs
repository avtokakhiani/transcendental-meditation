/* global process, console, URL */
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';

// Read existing users only. Never create users, seed, or contact Google in this check.
process.loadEnvFile('.env');
const base = 'http://localhost:31997';
const db = new PrismaClient({ log: [] });
const browser = await chromium.launch({ channel: 'chrome' });
function session(userId) {
  const payload = Buffer.from(JSON.stringify({ userId, expiresAt: Date.now() + 300000 })).toString('base64url');
  return `${payload}.${createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url')}`;
}
async function contextFor(user) {
  const context = await browser.newContext();
  if (user) await context.addCookies([{ name: 'tm_session', value: session(user.id), url: base, httpOnly: true, sameSite: 'Lax' }]);
  return context;
}
try {
  const anonymous = await contextFor();
  for (const endpoint of ['start', 'start-write', 'clear']) {
    const response = await anonymous.request.post(`${base}/api/admin/calendar-test/${endpoint}`, { headers: { Origin: base }, maxRedirects: 0 });
    assert.equal(response.status(), 401);
  }
  assert.equal((await anonymous.request.get(`${base}/api/admin/calendar-test/callback?code=synthetic-not-real`, { maxRedirects: 0 })).status(), 401);
  const admin = await db.user.findFirst({ where: { role: 'admin', isActive: true }, select: { id: true } });
  assert.ok(admin, 'An existing active site administrator is required; no users are created.');
  const context = await contextFor(admin);
  const page = await context.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => new URL(route.request().url()).origin === base ? route.continue() : route.abort());
  const response = await page.goto(`${base}/admin/calendar-test`);
  assert.equal(response.status(), 200);
  await page.getByRole('heading', { name: 'Google Calendar connectivity test' }).waitFor();
  assert.ok((await page.locator('main').textContent()).includes('calendar.events.owned.readonly'));
  assert.equal(response.headers()['referrer-policy'], 'same-origin');
  assert.match(response.headers()['cache-control'], /no-store/);
  for (const endpoint of ['start', 'start-write', 'clear']) {
    assert.equal((await context.request.post(`${base}/api/admin/calendar-test/${endpoint}`, { maxRedirects: 0 })).status(), 403);
    assert.equal((await context.request.post(`${base}/api/admin/calendar-test/${endpoint}`, { headers: { Origin: 'null' }, maxRedirects: 0 })).status(), 403);
    assert.equal((await context.request.post(`${base}/api/admin/calendar-test/${endpoint}`, { headers: { Origin: 'https://other.invalid' }, maxRedirects: 0 })).status(), 403);
  }
  assert.equal((await context.request.get(`${base}/api/admin/calendar-test/start-write`)).status(), 405);
  assert.equal((await context.request.post(`${base}/api/admin/calendar-test/start-write`, { headers: { Origin: base }, maxRedirects: 0 })).status(), 400, 'A missing explicit write confirmation must be rejected');
  await page.getByRole('heading', { name: 'Write-access test: create event + Google Meet, then delete', exact: true }).waitFor();
  const writeButton = page.getByRole('button', { name: 'Authorize write access and test event + Meet + cleanup', exact: true });
  if (await writeButton.isEnabled()) {
    let writePosts = 0;
    const countPost = request => { if (new URL(request.url()).pathname === '/api/admin/calendar-test/start-write' && request.method() === 'POST') writePosts++; };
    page.on('request', countPost);
    await writeButton.click({ noWaitAfter: true });
    assert.equal(writePosts, 0, 'The required checkbox prevents an accidental write authorization');
    await page.getByRole('checkbox', { name: /I authorize creation and automatic deletion/ }).check();
    const postedWrite = page.waitForResponse(response => new URL(response.url()).pathname === '/api/admin/calendar-test/start-write' && response.request().method() === 'POST');
    await writeButton.click({ noWaitAfter: true });
    const writeResponse = await postedWrite;
    assert.equal(await writeResponse.request().headerValue('origin'), base);
    assert.equal(writeResponse.status(), 303);
    const location = new URL(writeResponse.headers().location);
    assert.equal(location.origin, 'https://accounts.google.com');
    assert.equal(location.searchParams.get('scope'), 'openid email https://www.googleapis.com/auth/calendar.events.owned');
    assert.equal(location.searchParams.get('access_type'), 'online');
    assert.equal(location.searchParams.get('code_challenge_method'), 'S256');
    // External navigation is intercepted, so no Google consent or event mutation occurs.
    await page.goto(`${base}/admin/calendar-test`);
    await page.getByRole('heading', { name: 'Google Calendar connectivity test' }).waitFor();
    page.off('request', countPost);
  }
  // Exercise a real browser form submission: manually adding Origin to an API request
  // hides regressions where the document's referrer policy makes Origin become null.
  const authorize = page.getByRole('button', { name: 'Authorize and test read-only Calendar access' });
  const configuredForClick = await authorize.isEnabled();
  if (configuredForClick) {
    const posted = page.waitForResponse(response => new URL(response.url()).pathname === '/api/admin/calendar-test/start' && response.request().method() === 'POST');
    await authorize.click({ noWaitAfter: true });
    const response = await posted;
    const origin = await response.request().headerValue('origin');
    console.log(`Real browser form: Origin ${origin === base ? 'correct localhost origin' : origin === 'null' ? 'null' : 'missing or unexpected'}; HTTP ${response.status()}.`);
    assert.equal(origin, base, 'The browser form must preserve the exact local Origin for CSRF validation.');
    assert.equal(response.status(), 303, 'An authenticated admin form must redirect to Google.');
    const destination = new URL(response.headers().location);
    assert.equal(destination.origin, 'https://accounts.google.com');
    // All external routes are aborted above: no actual Google authorization is performed.
    await page.goto(`${base}/admin/calendar-test`);
    await page.getByRole('heading', { name: 'Google Calendar connectivity test' }).waitFor();
  }
  assert.equal((await context.request.get(`${base}/api/admin/calendar-test/start`)).status(), 405);
  const start = await context.request.post(`${base}/api/admin/calendar-test/start`, { headers: { Origin: base }, maxRedirects: 0 });
  const configured = await page.getByRole('button', { name: 'Authorize and test read-only Calendar access' }).isEnabled();
  assert.equal(start.status(), configured ? 303 : 503);
  if (configured) {
    const location = new URL(start.headers().location);
    assert.equal(location.origin, 'https://accounts.google.com');
    assert.equal(location.searchParams.get('access_type'), 'online');
    const flowCookie = (await context.cookies()).find(cookie => cookie.name === 'tm_calendar_test_state');
    assert.equal(flowCookie.httpOnly, true);
    assert.equal(flowCookie.sameSite, 'Lax');
  }
  // Invalid state must fail without attempting token exchange, even for an admin.
  const callback = await context.request.get(`${base}/api/admin/calendar-test/callback?state=synthetic-invalid-state&code=synthetic-not-real`, { maxRedirects: 0 });
  assert.equal(callback.status(), 303);
  assert.equal(callback.headers().location, `${base}/admin/calendar-test`);
  assert.equal(callback.headers()['referrer-policy'], 'no-referrer');
  assert.equal(callback.headers()['x-calendar-test-implementation'], 'owned-write-etag-retry-v4');
  await page.reload();
  assert.ok((await page.locator('main').textContent()).includes('session_error'));
  assert.ok((await page.locator('main').textContent()).includes('Result implementation: owned-write-etag-retry-v4'));
  const html = await page.content();
  for (const value of [process.env.GOOGLE_CALENDAR_TEST_CLIENT_SECRET, 'synthetic-not-real', 'synthetic-invalid-state']) {
    if (value) assert.ok(!html.includes(value), 'No credential, code, or state should be rendered.');
  }
  const clear = await context.request.post(`${base}/api/admin/calendar-test/clear`, { headers: { Origin: base }, maxRedirects: 0 });
  assert.equal(clear.status(), 303);
  await page.reload();
  assert.ok((await page.locator('main').textContent()).includes('Not tested.'));
  const editor = await db.user.findFirst({ where: { role: { not: 'admin' }, isActive: true }, select: { id: true } });
  if (editor) {
    const editorContext = await contextFor(editor);
    for (const endpoint of ['start', 'start-write', 'clear']) assert.equal((await editorContext.request.post(`${base}/api/admin/calendar-test/${endpoint}`, { headers: { Origin: base }, maxRedirects: 0 })).status(), 403);
    assert.equal((await editorContext.request.get(`${base}/api/admin/calendar-test/callback`, { maxRedirects: 0 })).status(), 403);
  }
  assert.deepEqual(errors, []);
  assert.equal((await anonymous.request.get(base)).status(), 200);
  console.log(`Live localhost Calendar test passed: admin page, authentication, CSRF, safe callback, clear, and public homepage.${editor ? ' Existing non-admin denied.' : ' No existing non-admin user available for a live role check.'} No Google authorization or Calendar request made.`);
} finally {
  await browser.close();
  await db.$disconnect();
}
