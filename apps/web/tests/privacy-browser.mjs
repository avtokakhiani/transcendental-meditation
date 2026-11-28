import assert from 'node:assert/strict';
import { createHmac, randomUUID } from 'node:crypto';
import { unlink } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';

const base = process.env.PRIVACY_TEST_URL || 'http://localhost:31997';
process.loadEnvFile('.env');
assert.notEqual(process.env.PRIVACY_EMAIL_DELIVERY_ENABLED, 'true', 'Browser test requires pre-launch email delivery disabled.');
const db = new PrismaClient({ log: [] });
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
const testEmail = `privacy-${randomUUID()}@example.invalid`;
const mapPolicy = 'ვებსაიტის „ჩვენ შესახებ“ გვერდზე ჩაშენებულია Google Maps-ის ინტერაქტიული რუკა, რომელიც გვერდის ჩატვირთვისას ავტომატურად იტვირთება. რუკის გამოყენებისას Google-ს შეიძლება გადაეცეს ტექნიკური ინფორმაცია, მათ შორის მომხმარებლის IP მისამართი, და Google-მა შეიძლება გამოიყენოს ქუქი-ფაილები ან მსგავსი ტექნოლოგიები საკუთარი კონფიდენციალურობის პოლიტიკის შესაბამისად.';
let inquiryId, editorId;
try {
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 } });
  const page = await context.newPage(), errors = [], external = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.route('**/*', route => {
    const url = new URL(route.request().url());
    if (url.origin !== base) { external.push(url.hostname); return route.abort(); }
    return route.continue();
  });
  await page.goto(base); await page.waitForLoadState('networkidle');
  const footerLink = page.locator('footer a[href="/privacy-policy"]');
  await footerLink.focus(); await page.keyboard.press('Enter');
  let modal = page.locator('dialog[open]'); await modal.waitFor();
  assert.equal(new URL(page.url()).pathname, '/');
  assert.equal(await modal.locator('article h2').count(), 14);
  assert.equal(await modal.locator('article h1').textContent(), 'კონფიდენციალურობის პოლიტიკა');
  assert.ok((await modal.textContent()).includes('info@learntm.ge'));
  assert.equal(await modal.getByText(mapPolicy, { exact: true }).count(), 1);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await modal.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
    const box = await modal.boundingBox(); assert.ok(Math.abs(box.x + box.width / 2 - width / 2) < 1);
    assert.ok(Math.abs(box.y + box.height / 2 - 450) < 1, 'Policy modal must be vertically centered.');
    assert.ok(await modal.evaluate(el => el.scrollWidth <= el.clientWidth));
    await page.keyboard.press('Shift+Tab'); assert.ok(await modal.evaluate(el => el.contains(document.activeElement)));
  }
  await page.keyboard.press('Escape'); await modal.waitFor({ state: 'hidden' });
  assert.ok(await footerLink.evaluate(el => el === document.activeElement));
  await page.setViewportSize({ width: 1440, height: 1000 });
  await footerLink.click(); await modal.waitFor(); await page.mouse.click(10, 10); await modal.waitFor({ state: 'hidden' });
  await page.locator('header a[href="/introductory-meeting"]').click(); await modal.locator('li > button').first().click();
  await modal.locator('a[href="/privacy-policy"]').click();
  assert.equal(await page.locator('dialog[open]').count(), 2);
  await page.keyboard.press('Escape'); assert.equal(await page.locator('dialog[open]').count(), 1);
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  await page.keyboard.press('Escape'); assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  await page.goto(`${base}/privacy-policy`); assert.equal(await page.locator('main article h2').count(), 14);
  assert.equal(await page.locator('main article').getByText(mapPolicy, { exact: true }).count(), 1);
  assert.match(await page.locator('meta[name="robots"]').getAttribute('content'), /noindex/);
  await page.goto(`${base}/about`); await page.waitForLoadState('networkidle');
  const map = page.locator('iframe[src*="google.com/maps"]');
  assert.equal(await map.count(), 1);
  assert.ok(external.includes('www.google.com'), 'Google Maps loads automatically without any click or scrolling.');
  assert.equal(await map.getAttribute('src'), 'https://www.google.com/maps?q=41.7101393,44.7803032&z=17&output=embed');
  assert.equal(await map.getAttribute('title'), 'თბილისი, სოფიკო ჭიაურელის ქ. 16 — Google Maps');
  assert.equal(await map.getAttribute('loading'), 'eager');
  const location = page.locator('section[aria-labelledby="location-heading"]');
  assert.equal(await location.locator('img, button').count(), 0);
  assert.equal(await location.locator('a[href="https://maps.app.goo.gl/W1US48i64FUsu7ps8"]').count(), 1);
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    const box = await map.boundingBox();
    assert.equal(box.height, width >= 1024 ? 420 : 360);
    assert.ok(box.x >= 0 && box.x + box.width <= width);
    assert.equal(await map.evaluate(el => getComputedStyle(el.parentElement).borderRadius), '12px');
  }
  const unauthenticated = await context.request.get(`${base}/admin/privacy`, { maxRedirects: 0 });
  assert.equal(unauthenticated.status(), 307);
  // The local backend stores the synthetic enquiry; pre-launch delivery is explicitly disabled.
  const response = await context.request.post(`${base}/api/corporate-inquiries`, { headers: { Origin: base }, data: {
    name: 'Privacy browser test', organization: 'Test only', email: testEmail, phone: '', contactMethod: 'ელფოსტით', message: 'Synthetic test; remove after verification.', website: '', startedAt: Date.now() - 3000,
  } });
  assert.equal(response.status(), 200);
  const inquiry = await db.corporateInquiry.findFirstOrThrow({ where: { email: testEmail } }); inquiryId = inquiry.id;
  assert.equal(inquiry.adminNotifiedAt, null);
  const authenticate = async userId => {
    const payload = Buffer.from(JSON.stringify({ userId, expiresAt: Date.now() + 600000 })).toString('base64url');
    const signature = createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url');
    await context.addCookies([{ name: 'tm_session', value: `${payload}.${signature}`, url: base, httpOnly: true, sameSite: 'Lax' }]);
  };
  const editor = await db.user.create({ data: { username: `privacy-${randomUUID()}`, email: `editor-${randomUUID()}@example.invalid`, passwordHash: 'not-a-login-account', firstName: 'Test', lastName: 'Editor', role: 'editor' } }); editorId = editor.id;
  await authenticate(editor.id); await page.goto(`${base}/admin/privacy`); assert.notEqual(new URL(page.url()).pathname, '/admin/privacy');
  const administrator = await db.user.findFirstOrThrow({ where: { role: 'admin', isActive: true }, select: { id: true } });
  await authenticate(administrator.id); await page.goto(`${base}/admin/privacy`);
  await page.locator('input[name="email"]').first().fill(testEmail); await page.getByRole('button', { name: 'ძებნა', exact: true }).click();
  const record = page.locator(`section[id="corporate-${inquiryId}"]`); await record.waitFor();
  await record.locator('input[name="confirmed"]').check();
  const perform = async name => {
    await record.locator('input[name="confirmed"]').check();
    const completed = page.waitForResponse(result => result.request().method() === 'POST' && result.url().includes('/admin/privacy'));
    await record.getByRole('button', { name, exact: true }).click(); await (await completed).finished();
    await record.getByRole('status').waitFor();
  };
  await perform('დამუშავების შეზღუდვა');
  assert.ok((await db.corporateInquiry.findUniqueOrThrow({ where: { id: inquiryId } })).processingRestrictedAt);
  await perform('შეზღუდვის მოხსნა'); assert.equal((await db.corporateInquiry.findUniqueOrThrow({ where: { id: inquiryId } })).processingRestrictedAt, null);
  await perform('დღევანდელი კომუნიკაციის აღრიცხვა');
  assert.ok((await db.corporateInquiry.findUniqueOrThrow({ where: { id: inquiryId } })).lastBusinessContactAt >= inquiry.lastBusinessContactAt);
  await perform('ასლის მომზადება');
  assert.ok((await record.locator('textarea[readonly]').inputValue()).includes(testEmail));
  assert.ok(!(await record.locator('textarea[readonly]').inputValue()).includes('deduplicationKey'));
  await record.locator('input[name="name"]').fill('Corrected synthetic test'); await perform('შესწორება');
  assert.equal((await db.corporateInquiry.findUniqueOrThrow({ where: { id: inquiryId } })).name, 'Corrected synthetic test');
  const deleted = page.waitForResponse(result => result.request().method() === 'POST' && result.url().includes('/admin/privacy'));
  await record.locator('input[name="confirmed"]').check();
  await record.getByRole('button', { name: 'ჩანაწერის წაშლა', exact: true }).click(); await (await deleted).finished();
  assert.equal(await db.corporateInquiry.findUnique({ where: { id: inquiryId } }), null);
  assert.ok(await db.privacyErasure.findFirst({ where: { targetId: inquiryId } }));
  assert.deepEqual(errors, []);
  console.log('Passed: exact 14-section shared policy modal/fallback including revised Maps paragraph, mobile sizing, focus/backdrop/Escape, nested dialog scroll locks, automatic Google iframe and original responsive dimensions, corporate persistence, administrator-only access, correction/export/restriction/contact/deletion controls. No real email sent.');
} finally {
  if (inquiryId) {
    await db.corporateInquiry.deleteMany({ where: { id: inquiryId } });
    await db.privacyErasure.deleteMany({ where: { targetId: inquiryId } });
    await db.privacyAudit.deleteMany({ where: { targetId: inquiryId } });
    await unlink(path.resolve(process.env.PRIVACY_STORAGE_DIR || 'private', 'erasures', `corporate-${inquiryId}.json`)).catch(() => {});
  }
  if (editorId) await db.user.delete({ where: { id: editorId } });
  await browser.close(); await db.$disconnect();
}
