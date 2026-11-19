import assert from 'node:assert/strict';
import { chromium } from 'playwright';

const base = process.env.CORPORATE_TEST_URL ?? 'http://localhost:31997';
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL ?? 'chrome' });
try {
  const page = await browser.newPage();
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  assert.equal((await page.goto(`${base}/organizaciebitvis`)).status(), 200);
  await page.evaluate(() => document.fonts.ready);
  assert.equal(await page.locator('h1').count(), 1);
  assert.equal(await page.locator('details').count(), 6);
  assert.equal(await page.locator('ol > li').count(), 5);
  assert.ok(await page.locator('meta[name="description"]').getAttribute('content'));
  assert.equal(await page.locator('a[href="#corporate-contact"]').count(), 1);
  assert.equal(await page.locator('a[href="/benefits"]').count() > 0, true);
  for (const width of [360, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth), `overflow at ${width}`);
    const image = page.locator('section').first().locator('img');
    await image.evaluate(img => img.decode());
    assert.ok(await image.evaluate(img => img.naturalWidth > 0));
    if (width === 1440) {
      const box = await page.locator('section').first().boundingBox();
      assert.ok(box.height >= 400 && box.height <= 500, `hero height ${box.height}`);
      await page.getByRole('button', { name: 'მეტი', exact: true }).focus();
      await page.keyboard.press('Enter');
      await page.getByRole('link', { name: 'ორგანიზაციებისთვის', exact: true }).waitFor();
      assert.ok(await page.getByRole('link', { name: 'ორგანიზაციებისთვის', exact: true }).isVisible());
      await page.keyboard.press('Escape');
    } else if (width === 390) {
      await page.getByRole('button', { name: 'მენიუს გახსნა' }).click();
      assert.ok(await page.getByRole('link', { name: 'ორგანიზაციებისთვის', exact: true }).isVisible());
      await page.getByRole('button', { name: 'მენიუს დახურვა' }).click();
    }
  }
  await page.locator('a[href="#corporate-contact"]').click();
  await page.waitForFunction(() => Math.abs(document.querySelector('#corporate-contact').getBoundingClientRect().top - 96) < 3);
  await page.locator('summary').first().focus();
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('details').first().getAttribute('open'), '');
  await page.locator('#corporate-name').fill('Test Person');
  await page.locator('#corporate-organization').fill('Test Organization');
  await page.locator('#corporate-email').fill('invalid');
  assert.equal(await page.locator('#corporate-email').evaluate(el => el.checkValidity()), false);
  await page.locator('#corporate-email').fill('test@example.invalid');
  await page.locator('#corporate-method').selectOption('ტელეფონით');
  assert.equal(await page.locator('#corporate-phone').evaluate(el => el.required && !el.checkValidity()), true);
  await page.locator('#corporate-phone').fill('not a phone');
  assert.equal(await page.locator('#corporate-phone').evaluate(el => el.checkValidity()), false);
  await page.locator('#corporate-phone').fill('+995 511 123 456');
  assert.equal(await page.locator('#corporate-phone').evaluate(el => el.checkValidity()), true);

  // The unconfigured local endpoint must report failure, never false success.
  const response = await page.evaluate(async () => {
    const body = { name: 'Test', organization: 'Test', email: 'qa@example.invalid', phone: '', program: 'ორივე პროგრამა', contactMethod: 'ელფოსტით', message: '', website: '', startedAt: Date.now() - 5000 };
    const post = async value => (await fetch('/api/corporate-inquiries', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(value) })).status;
    return [await post({ ...body, email: 'bad' }), await post({ ...body, contactMethod: 'ტელეფონით' }), await post({ ...body, website: 'spam' }), await post(body)];
  });
  assert.deepEqual(response, [400, 400, 400, 503]);
  await page.waitForTimeout(2100);
  await page.getByRole('button', { name: 'გაგზავნე მოთხოვნა' }).click();
  await page.locator('#corporate-error').waitFor();
  assert.equal(await page.locator('#corporate-name').inputValue(), 'Test Person');

  // Exercise UI loading, duplicate-click protection and success without sending email.
  let requests = 0;
  await page.route('**/api/corporate-inquiries', async route => {
    requests++;
    await new Promise(resolve => setTimeout(resolve, 200));
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ ok: true }) });
  });
  await page.getByRole('button', { name: 'გაგზავნე მოთხოვნა' }).click();
  assert.equal(await page.getByRole('button', { name: 'გაგზავნე მოთხოვნა' }).isDisabled(), true);
  await page.getByRole('status').waitFor();
  assert.equal(requests, 1);
  assert.equal(await page.locator('form[aria-label="მოითხოვე გაცნობითი შეხვედრა"]').count(), 0);
  assert.deepEqual(errors, []);
  await page.unroute('**/api/corporate-inquiries');
  await page.goto(`${base}/organizaciebitvis`);
  await page.screenshot({ path: '.next/corporate-desktop.png', fullPage: true });
  await page.setViewportSize({ width: 390, height: 844 });
  await page.screenshot({ path: '.next/corporate-mobile.png', fullPage: true });
  console.log('Corporate page: responsive layout, navigation, CTA, FAQ, validation, unconfigured delivery, loading and success checks passed.');
} finally { await browser.close(); }
