/* global document, getComputedStyle, innerWidth */
import assert from 'node:assert/strict';
import { mkdir, writeFile, rm, rmdir } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';

const web = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const fixture = path.join(web, 'src/app/(site)/article-layout-check-fixture');
const base = process.env.ARTICLE_TEST_URL ?? 'http://localhost:31997';
const widths = [390, 639, 640, 768, 1023, 1024, 1440];
const near = (actual, expected, label) =>
  assert.ok(Math.abs(actual - expected) < 0.05, `${label}: ${actual} != ${expected}`);
let browser;
let fixtureCreated = false;

async function inspect(page, route, width) {
  await page.setViewportSize({ width, height: 1000 });
  const response = await page.goto(`${base}${route}`);
  assert.equal(response.status(), 200, route);
  await page.evaluate(() => document.fonts.ready);
  return page
    .locator('article')
    .first()
    .evaluate((article) => {
      const cta = article.querySelector(':scope > section:last-child');
      const body = cta.previousElementSibling;
      const blocks = [...body.children];
      const rect = (el) => el.getBoundingClientRect();
      const style = (el) => getComputedStyle(el);
      return {
        padding: [parseFloat(style(body).paddingTop), parseFloat(style(body).paddingBottom)],
        width: rect(blocks[0]).width,
        gaps: blocks.slice(1).map((block, index) => rect(block).top - rect(blocks[index]).bottom),
        columns: blocks
          .filter((block) => style(block).display === 'grid')
          .map((block) => ({
            template: style(block).gridTemplateColumns.split(' ').map(parseFloat),
            gap: parseFloat(style(block).columnGap),
            text: rect(block.firstElementChild).x,
            figure: rect(block.querySelector('figure')).x,
          })),
        typography: [...body.querySelectorAll('h2,p,li')]
          .slice(0, 5)
          .map((el) => ({
            tag: el.tagName,
            fontSize: style(el).fontSize,
            lineHeight: style(el).lineHeight,
          })),
        flow: (() => {
          const root = body.querySelector('.prose');
          if (!root) return null;
          const heading = root.querySelector('h2'),
            paragraphs = root.querySelectorAll('p'),
            bullets = root.querySelectorAll('li');
          return {
            headingToParagraph: rect(paragraphs[0]).top - rect(heading).bottom,
            paragraphs: rect(paragraphs[1]).top - rect(paragraphs[0]).bottom,
            bullets: rect(bullets[1]).top - rect(bullets[0]).bottom,
          };
        })(),
        cta: {
          padding: [style(cta).paddingTop, style(cta).paddingBottom],
          background: style(cta).backgroundImage,
          heading: cta.querySelector('h2').textContent,
          description: cta.querySelector('p').textContent,
          buttons: [...cta.querySelectorAll('a')].map((el) => ({
            text: el.textContent,
            href: el.getAttribute('href'),
            fontSize: style(el).fontSize,
            padding: style(el).padding,
          })),
        },
        overflow: document.documentElement.scrollWidth > innerWidth,
      };
    });
}

try {
  // Fail if a real route already exists; remove only the directory this check creates.
  await mkdir(fixture);
  fixtureCreated = true;
  await writeFile(
    path.join(fixture, 'page.tsx'),
    "export { default } from '../../../../tests/fixtures/article-layout-page';\n",
  );
  browser = await chromium.launch(process.platform === 'win32' ? { channel: 'chrome' } : {});
  const page = await browser.newPage();
  for (const width of widths) {
    const padding = width >= 1024 ? 84 : width >= 640 ? 60 : 48;
    const gap = width >= 1024 ? 128 : width >= 640 ? 93 : 70;
    const reference = await inspect(page, '/blog/gulis-janmrteloba-da-meditatsia', width);
    assert.deepEqual(reference.padding, [padding, padding]);
    reference.gaps.forEach((value) => near(value, gap, 'Reference section gap'));
    for (const route of [
      '/blog/meditatsia-stresis-shesamtsireblad',
      '/blog/meditatsia-uketesi-dzilistvis',
      '/article-layout-check-fixture',
    ]) {
      const actual = await inspect(page, route, width);
      const bottom = route.includes('dzilistvis')
        ? width >= 1024
          ? 88
          : width >= 640
            ? 64
            : 48
        : padding;
      assert.deepEqual(actual.padding, [padding, bottom], route);
      near(actual.width, Math.min(width, 800), 'Reading width');
      actual.gaps.forEach((value) => near(value, gap, 'Section gap'));
      assert.deepEqual(actual.cta, reference.cta, 'CTA matches finalized reference');
      assert.equal(actual.cta.buttons.length, 1);
      for (const grid of actual.columns) {
        assert.equal(grid.template.length, width >= 1024 ? 2 : 1);
        if (width >= 1024) near(grid.template[0], grid.template[1], 'Equal columns');
        near(grid.gap, width >= 1024 ? 48 : 32, 'Column gap');
      }
      assert.equal(actual.overflow, false, 'No horizontal overflow');
      if (route === '/article-layout-check-fixture' && width >= 1024) {
        assert.ok(actual.columns[0].text < actual.columns[0].figure, 'Right chart');
        assert.ok(actual.columns[1].text > actual.columns[1].figure, 'Left chart');
      }
    }
    const markdown = await inspect(page, '/article-layout-check-fixture?mode=markdown', width);
    const html = await inspect(page, '/article-layout-check-fixture?mode=html', width);
    assert.deepEqual(
      markdown.typography,
      html.typography,
      'CMS HTML and Markdown use the same typography',
    );
    for (const post of [markdown, html]) {
      assert.deepEqual(post.padding, [padding, padding]);
      near(post.width, Math.min(width, 800), 'New CMS post width');
      assert.deepEqual(post.cta, reference.cta, 'New CMS posts get the standard CTA');
      near(post.flow.headingToParagraph, 24, 'Heading gap');
      near(post.flow.paragraphs, 24, 'Paragraph gap');
      near(post.flow.bullets, 8, 'Bullet gap');
    }
    console.log(`Article layout verified at ${width}px`);
  }
} finally {
  await browser?.close();
  if (fixtureCreated) {
    await rm(path.join(fixture, 'page.tsx'));
    await rmdir(fixture);
  }
}
