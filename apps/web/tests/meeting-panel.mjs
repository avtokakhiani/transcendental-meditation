import assert from 'node:assert/strict';
import { chromium } from 'playwright';
import { createHmac } from 'node:crypto';
import { PrismaClient } from '@prisma/client';

const base = process.env.MEETING_TEST_URL || 'http://localhost:31997';
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
const future = (days = 1) => new Date(Date.now() + days * 86400000).toISOString();
// Browser fixtures are intercepted responses, never scheduled or stored meetings.
const fixtures = [
  { id: '11111111-1111-4111-8111-111111111111', startsAt: future(), format: 'online', location: null, availability: 'open', remaining: 5 },
  { id: '22222222-2222-4222-8222-222222222222', startsAt: future(2), format: 'in_person', location: 'TEST LOCATION', availability: 'open', remaining: null },
  { id: '33333333-3333-4333-8333-333333333333', startsAt: future(3), format: 'online', location: null, availability: 'full', remaining: 0 },
  { id: '44444444-4444-4444-8444-444444444444', startsAt: future(4), format: 'online', location: null, availability: 'closed', remaining: null },
];
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  assert.equal((await page.request.get(`${base}/api/meetings`)).status(), 200);
  const noOrigin = await page.request.post(`${base}/api/meetings/register`, { data: {} });
  assert.equal(noOrigin.status(), 403);
  const invalid = await page.request.post(`${base}/api/meetings/register`, { headers: { Origin: base }, data: {} });
  assert.equal(invalid.status(), 400);
  const requests = [];
  await page.route('**/api/meetings', route => route.fulfill({ json: { meetings: fixtures } }));
  let registrationStatus = 200;
  await page.route('**/api/meetings/register', async route => {
    requests.push(route.request().postDataJSON());
    await new Promise(resolve => setTimeout(resolve, 150));
    await route.fulfill({ status: registrationStatus, json: registrationStatus === 200 ? { ok: true } : { error: 'TEST ERROR' } });
  });
  await page.goto(base);
  const headerCta = page.locator('header a[href="/introductory-meeting"]');
  await headerCta.focus(); await page.keyboard.press('Enter');
  const panel = page.locator('dialog[open]');
  await panel.waitFor();
  assert.equal(new URL(page.url()).pathname, '/');
  assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
  if (await panel.locator('time[datetime="2026-11-25T19:00:00+04:00"]').count()) {
    const previewCards = panel.locator('li > button');
    assert.deepEqual(await panel.locator('time').evaluateAll(nodes => nodes.map(node => node.dateTime)), [
      '2026-11-25T19:00:00+04:00', '2026-11-27T18:30:00+04:00', '2026-11-30T20:00:00+04:00', '2026-12-02T19:00:00+04:00',
    ]);
    assert.deepEqual(await panel.locator('time').allTextContents(), ['25 ნოემბერი • 19:00', '27 ნოემბერი • 18:30', '30 ნოემბერი • 20:00', '2 დეკემბერი • 19:00']);
    assert.doesNotMatch(await panel.textContent(), /სატესტო|დროებითი|თარიღი და დრო მითითებულია/);
    const teachers = ['ავთანდილ კახიანი', 'ლარისა პარკაძე', 'ლარისა პარკაძე', 'ავთანდილ კახიანი'];
    for (let index = 0; index < 4; index++) {
      const card = previewCards.nth(index);
      const text = await card.textContent();
      assert.ok(text.includes(teachers[index]));
      assert.ok(text.includes(index % 2 ? 'პირისპირ' : 'ონლაინ'));
      assert.equal(text.includes('თბილისი, ვერა'), Boolean(index % 2));
      await card.click();
      assert.equal(await panel.locator('form').count(), 1);
      assert.equal(await panel.locator('li > button[aria-expanded="true"]').count(), 1);
    }
    const previewForm = panel.locator('form');
    await previewForm.locator('button[type="submit"]').click();
    assert.equal(await panel.getByRole('status').count(), 0, 'Test form must validate required fields.');
    for (const [name, value] of Object.entries({ firstName: 'Test', lastName: 'Preview', email: 'preview@example.invalid', phone: '+995511111111' })) await previewForm.locator(`[name="${name}"]`).fill(value);
    await previewForm.locator('button[type="submit"]').click();
    await panel.getByRole('status').waitFor();
    assert.equal(await panel.getByRole('status').textContent(), 'ფორმა წარმატებით შეივსო.');
    assert.equal(requests.length, 0, 'Preview must never submit to the real registration API.');
  }
  await page.keyboard.press('Escape');
  await panel.waitFor({ state: 'hidden' });
  assert.equal(await headerCta.evaluate(el => el === document.activeElement), true);
  assert.equal(await page.evaluate(() => document.body.style.overflow), '');
  // Exercise real registration behavior separately from temporary panel previews.
  await page.goto(`${base}/introductory-meeting`);
  const registration = page.locator('main');
  const cards = registration.locator('li > button');
  await cards.first().waitFor();
  assert.equal(await cards.count(), 4);
  assert.equal(await cards.nth(2).isDisabled(), true);
  assert.equal(await cards.nth(3).isDisabled(), true);
  await cards.nth(0).click();
  assert.equal(await registration.locator('form').count(), 1);
  await cards.nth(1).click();
  assert.equal(await registration.locator('form').count(), 1);
  assert.equal(await cards.nth(0).getAttribute('aria-expanded'), 'false');
  const form = registration.locator('form');
  await form.locator('button[type="submit"]').click();
  assert.equal(requests.length, 0, 'Required fields prevent submission.');
  for (const [name, value] of Object.entries({ firstName: 'Test', lastName: 'Participant', email: 'test@example.invalid', phone: '+995511111111' })) await form.locator(`[name="${name}"]`).fill(value);
  registrationStatus = 503;
  await form.locator('button[type="submit"]').click();
  await form.getByRole('alert').waitFor();
  assert.equal(await form.locator('[name="email"]').inputValue(), 'test@example.invalid');
  registrationStatus = 200;
  await form.evaluate(el => { el.requestSubmit(); el.requestSubmit(); });
  await registration.getByRole('status').waitFor();
  assert.equal(requests.length, 2);
  assert.equal(requests[1].meetingId, fixtures[1].id);
  assert.equal(requests[1].email, 'test@example.invalid');
  await page.goto(base);
  for (const width of [360, 390, 600, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.locator('main a[href="/introductory-meeting"]').first().click();
    await panel.waitFor();
    await panel.evaluate(el => Promise.all(el.getAnimations().map(animation => animation.finished)));
    const box = await panel.boundingBox();
    assert.ok(Math.abs(box.width - (width < 640 ? width : 560)) < 1);
    assert.ok(Math.abs(box.x + box.width - (width < 640 ? width : width - 16)) < 1);
    assert.ok(await panel.evaluate(el => el.scrollWidth <= el.clientWidth));
    await page.keyboard.press('Shift+Tab');
    assert.ok(await panel.evaluate(el => el.contains(document.activeElement)));
    await page.keyboard.press('Escape');
  }
  await page.setViewportSize({ width: 1440, height: 1000 });
  await headerCta.click(); await panel.waitFor();
  await page.mouse.click(20, 200); await panel.waitFor({ state: 'hidden' });
  for (const width of [1440, 768, 390]) {
    await page.setViewportSize({ width, height: 1000 });
    await page.goto(`${base}/organizaciebitvis`);
    await page.waitForLoadState('networkidle');
    await page.locator('a[href="#corporate-contact"]').click();
    assert.equal(await panel.count(), 0);
    assert.equal(new URL(page.url()).hash, '#corporate-contact');
    assert.equal(await page.locator('#corporate-contact form').count(), 1);
    await page.waitForFunction(() => window.scrollY > 500);
    if (width >= 640) {
      await headerCta.click(); await panel.waitFor();
      assert.equal(new URL(page.url()).pathname, '/organizaciebitvis');
      assert.equal(new URL(page.url()).hash, '#corporate-contact');
      assert.equal(await panel.locator('h1, h2').first().textContent(), 'გაცნობითი შეხვედრები');
      await page.keyboard.press('Escape'); await panel.waitFor({ state: 'hidden' });
    }
    if (width < 1280) {
      const menuTrigger = page.locator('header button[aria-controls="site-mobile-menu"], header button[aria-label="მენიუს გახსნა"]');
      await menuTrigger.click();
      const menu = page.locator('#site-mobile-menu');
      await menu.locator('a[href="/introductory-meeting"]').click();
      await panel.waitFor(); await menu.waitFor({ state: 'hidden' });
      assert.equal(new URL(page.url()).pathname, '/organizaciebitvis');
      assert.equal(new URL(page.url()).hash, '#corporate-contact');
      assert.equal(await page.evaluate(() => document.body.style.overflow), 'hidden');
      await page.keyboard.press('Tab');
      assert.ok(await panel.evaluate(el => el.contains(document.activeElement)), 'Mobile menu must not trap panel focus.');
      await page.keyboard.press('Escape'); await panel.waitFor({ state: 'hidden' });
      assert.equal(await page.evaluate(() => document.body.style.overflow), '');
      assert.ok(await menuTrigger.evaluate(el => el === document.activeElement));
    }
    // The corporate action still scrolls to its own form after using the panel.
    await page.locator('a[href="#corporate-contact"]').click();
    assert.equal(await panel.count(), 0);
    assert.equal(new URL(page.url()).pathname, '/organizaciebitvis');
  }
  await page.unroute('**/api/meetings');
  for (const route of ['/how-to-learn', '/benefits']) {
    await page.goto(`${base}${route}`);
    await page.setViewportSize({ width: 1440, height: 1000 });
    await headerCta.click(); await panel.waitFor();
    assert.equal(new URL(page.url()).pathname, route);
    await page.keyboard.press('Escape');
    for (const link of await page.locator('main a[href="/introductory-meeting"]').all()) {
      await link.click(); await panel.waitFor();
      assert.equal(new URL(page.url()).pathname, route);
      await page.keyboard.press('Escape');
    }
  }
  await page.route('**/api/meetings', route => route.fulfill({ json: { meetings: [] } }));
  await page.goto(`${base}/introductory-meeting`);
  await page.getByRole('status').filter({ hasText: 'დაგეგმილი არ არის' }).waitFor();
  assert.match(await page.getByRole('status').textContent(), /დაგეგმილი არ არის/);
  const adminResponse = await page.goto(`${base}/admin/meetings`);
  assert.ok(adminResponse.ok());
  assert.equal(new URL(page.url()).pathname, '/admin/login');
  process.loadEnvFile('.env');
  const db = new PrismaClient();
  try {
    const user = await db.user.findFirst({ where: { isActive: true }, select: { id: true } });
    if (user) {
      const payload = Buffer.from(JSON.stringify({ userId: user.id, expiresAt: Date.now() + 60000 })).toString('base64url');
      const signature = createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url');
      await page.context().addCookies([{ name: 'tm_session', value: `${payload}.${signature}`, url: base, httpOnly: true, sameSite: 'Lax' }]);
      await page.goto(`${base}/admin/meetings`);
      assert.equal(new URL(page.url()).pathname, '/admin/meetings');
      assert.equal(await page.locator('input[name="startsAt"]').first().getAttribute('type'), 'datetime-local');
      assert.equal(await page.locator('select[name="status"]').first().inputValue(), 'draft');
    }
  } finally { await db.$disconnect(); }
  assert.deepEqual(errors, []);
  console.log('Passed: shared header panel across routes and corporate desktop/tablet/mobile navigation, independent corporate anchor, mobile menu dismissal/focus/scroll, modal/focus/Escape/backdrop, responsive sizing, accordion, validation/submission states, compatibility route, empty state, admin access.');
} finally { await browser.close(); }
