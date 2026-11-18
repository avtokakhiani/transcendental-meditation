/* global document, getComputedStyle, innerWidth, requestAnimationFrame, performance */
import assert from 'node:assert/strict';
import process from 'node:process';
import console from 'node:console';
import { chromium } from 'playwright';

const base = process.env.ARTICLE_TEST_URL ?? 'http://localhost:31997';
const selector = 'section[aria-labelledby="related-articles-heading"]';
const near = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < 1, `${label}: ${actual} != ${expected}`);
let browser;

async function waitForPosition(viewport, index) {
  await viewport.evaluate(
    (element, index) =>
      new Promise((resolve, reject) => {
        const step =
          element.firstElementChild.getBoundingClientRect().width +
          parseFloat(getComputedStyle(element).columnGap);
        const target = Math.min(index * step, element.scrollWidth - element.clientWidth);
        const start = performance.now();
        const check = () =>
          Math.abs(element.scrollLeft - target) < 1
            ? resolve()
            : performance.now() - start > 5000
              ? reject(new Error('Carousel scroll did not reach the expected card'))
              : requestAnimationFrame(check);
        check();
      }),
    index,
  );
}

try {
  browser = await chromium.launch(process.platform === 'win32' ? { channel: 'chrome' } : {});
  const context = await browser.newContext({ hasTouch: true, reducedMotion: 'reduce' });
  const page = await context.newPage();
  page.setDefaultTimeout(15000);
  await page.goto(`${base}/blog`);
  const catalogLinks = [
    ...new Set(
      await page
        .locator('section[aria-label="სტატიები"] article a')
        .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href'))),
    ),
  ];
  assert.ok(catalogLinks.length > 0, 'Read the actual listing instead of a separate article list');

  for (const [width, visible] of [
    [390, 1],
    [767, 1],
    [768, 2],
    [1023, 2],
    [1024, 3],
    [1440, 3],
  ]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const current of catalogLinks) {
      await page.goto(`${base}${current}`);
      const section = page.locator(selector);
      const expected = catalogLinks.filter((link) => link !== current);
      if (!expected.length) {
        assert.equal(await section.count(), 0);
        continue;
      }
      assert.equal(await section.count(), 1);
      const viewport = section.getByRole('group');
      const links = await section
        .locator('article a')
        .evaluateAll((anchors) => anchors.map((anchor) => anchor.getAttribute('href')));
      assert.deepEqual(new Set(links), new Set(expected), 'Only other published listing articles');
      assert.equal(links.length, expected.length, 'No duplicates or filler cards');
      const layout = await viewport.evaluate((el) => ({
        visible: Number(getComputedStyle(el).getPropertyValue('--visible-cards')),
        cardWidth: el.firstElementChild.getBoundingClientRect().width,
        width: el.clientWidth - 12,
        gap: parseFloat(getComputedStyle(el).columnGap),
        overflow: document.documentElement.scrollWidth > innerWidth,
      }));
      assert.equal(layout.visible, visible);
      near(
        layout.cardWidth * visible + layout.gap * (visible - 1),
        layout.width,
        'Existing card widths',
      );
      assert.equal(layout.overflow, false);
      const next = section.getByRole('button', { name: 'შემდეგი სტატია' });
      const previous = section.getByRole('button', { name: 'წინა სტატია' });
      if (expected.length > visible) {
        await next.waitFor();
        assert.equal(await previous.isDisabled(), true);
        const placement = await next.evaluate((button) => {
          const arrows = button.parentElement;
          const link = arrows.nextElementSibling;
          const a = arrows.getBoundingClientRect(),
            b = link.getBoundingClientRect();
          return {
            href: link.getAttribute('href'),
            gap: b.left - a.right,
            centerDifference: a.top + a.height / 2 - (b.top + b.height / 2),
          };
        });
        assert.equal(placement.href, '/blog', 'Arrows immediately before the listing link');
        near(placement.gap, 16, 'Controls spacing');
        near(placement.centerDifference, 0, 'Controls alignment');
        await next.click();
        await waitForPosition(viewport, 1);
        await previous.click();
        await waitForPosition(viewport, 0);
        await viewport.focus();
        await page.keyboard.press('ArrowRight');
        await waitForPosition(viewport, 1);
        await page.keyboard.press('End');
        await waitForPosition(viewport, expected.length - visible);
        assert.equal(await next.isDisabled(), true);
        await page.keyboard.press('Home');
        await waitForPosition(viewport, 0);
        await page.keyboard.press('Tab');
        assert.equal(
          await viewport
            .locator('article a')
            .first()
            .evaluate((el) => el === document.activeElement),
          true,
        );
        assert.equal(
          await viewport
            .locator('article a')
            .first()
            .evaluate((el) => getComputedStyle(el).outlineStyle),
          'solid',
        );
      } else {
        assert.equal(
          await section.getByRole('button').count(),
          0,
          'No arrows when every card fits',
        );
      }
      assert.equal(
        await section.getByRole('link', { name: 'ყველა სტატია' }).getAttribute('href'),
        '/blog',
      );
      assert.equal(await section.evaluate((el) => el.previousElementSibling.tagName), 'ARTICLE');
      assert.ok(
        await section.evaluate(
          (el) =>
            el.getBoundingClientRect().bottom <=
            document.querySelector('footer').getBoundingClientRect().top,
        ),
      );
    }
    console.log(`Catalog-only recommendations, controls and layout verified at ${width}px`);
  }

  if (catalogLinks.length > 2) {
    await page.setViewportSize({ width: 390, height: 1000 });
    await page.goto(`${base}${catalogLinks[0]}`);
    const viewport = page.locator(selector).getByRole('group');
    await viewport.scrollIntoViewIfNeeded();
    const bounds = await viewport.boundingBox();
    const cdp = await context.newCDPSession(page);
    const y = Math.round(bounds.y + 80);
    await cdp.send('Input.dispatchTouchEvent', {
      type: 'touchStart',
      touchPoints: [{ x: 330, y }],
    });
    for (const x of [285, 230, 170, 110, 55]) {
      await cdp.send('Input.dispatchTouchEvent', { type: 'touchMove', touchPoints: [{ x, y }] });
      await page.waitForTimeout(40);
    }
    await cdp.send('Input.dispatchTouchEvent', { type: 'touchEnd', touchPoints: [] });
    await page.waitForFunction(
      () =>
        document.querySelector('section[aria-labelledby="related-articles-heading"] [role="group"]')
          .scrollLeft > 100,
    );
    console.log('Native touch swipe verified using real catalog cards');
  }

  await page.goto(`${base}${catalogLinks[0]}`);
  const destination = await page
    .locator(selector)
    .locator('article a')
    .first()
    .getAttribute('href');
  await page.locator(selector).locator('article a').first().click();
  await page.waitForURL(`${base}${destination}`);
  assert.equal(
    await page.locator(selector).locator(`a[href="${destination}"]`).count(),
    0,
    'Current article updates after navigation',
  );

  // The separate TM page is a legitimate navigation destination, not a catalog article.
  const tmPage = await page.goto(`${base}/blog/ra-aris-transtsendentuli-meditatsia`);
  assert.equal(tmPage.status(), 200);
  assert.equal(await page.locator(selector).count(), 0);
  console.log('Real catalog navigation verified; separate TM page preserved');
} finally {
  await browser?.close();
}
