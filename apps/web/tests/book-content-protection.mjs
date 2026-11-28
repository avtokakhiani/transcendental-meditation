import assert from 'node:assert/strict';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';

const base = process.env.BOOK_TEST_URL || 'http://localhost:31997';
process.loadEnvFile('.env');
const db = new PrismaClient({ log: [] });
const book = await db.book.findFirstOrThrow({
  where: { status: 'published', pages: { some: { status: 'published' } } },
  select: { slug: true, pages: { where: { status: 'published' }, select: { number: true }, orderBy: { number: 'asc' } } },
});
await db.$disconnect();
const readerUrl = `${base}/books/${book.slug}/${book.pages[0].number}`;
const browser = await chromium.launch({ channel: process.env.PLAYWRIGHT_CHANNEL || 'chrome' });
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 } });
  const errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(readerUrl); await page.waitForLoadState('networkidle');
  const chapters = page.locator('[data-book-content]');
  assert.equal(await chapters.count(), book.pages.length);
  assert.ok(await chapters.first().evaluate(el => !el.closest('[aria-hidden="true"], [inert]')));
  assert.ok((await chapters.first().ariaSnapshot()).length > 40, 'Chapter text remains available to the accessibility tree.');
  const paragraph = page.locator('.reader-text p, .reader-text li').first();
  assert.equal(await paragraph.evaluate(el => getComputedStyle(el).userSelect), 'none');
  await paragraph.scrollIntoViewIfNeeded();
  await page.evaluate(() => window.getSelection().removeAllRanges());
  const box = await paragraph.boundingBox();
  await page.mouse.move(box.x + 5, box.y + 12); await page.mouse.down();
  await page.mouse.move(box.x + Math.min(200, box.width - 10), box.y + 12, { steps: 10 }); await page.mouse.up();
  assert.equal(await page.evaluate(() => window.getSelection().toString()), '', 'Ordinary pointer selection is disabled.');

  const results = await page.evaluate(() => {
    const chapter = document.querySelector('[data-book-content]');
    const text = chapter.querySelector('.reader-text p, .reader-text li');
    const header = document.querySelector('header p');
    const select = element => { const range = document.createRange(); range.selectNodeContents(element); const selection = window.getSelection(); selection.removeAllRanges(); selection.addRange(range); };
    const canceled = (element, type, eventClass = Event, options = {}) => {
      const event = new eventClass(type, { bubbles: true, cancelable: true, ...options }); element.dispatchEvent(event); return event.defaultPrevented;
    };
    const result = {};
    select(text);
    result.copy = canceled(document.body, 'copy', ClipboardEvent);
    result.cut = canceled(document.body, 'cut', ClipboardEvent);
    result.ctrlC = canceled(document.body, 'keydown', KeyboardEvent, { key: 'c', ctrlKey: true });
    result.cmdC = canceled(document.body, 'keydown', KeyboardEvent, { key: 'c', metaKey: true });
    result.ctrlInsert = canceled(document.body, 'keydown', KeyboardEvent, { key: 'Insert', ctrlKey: true });
    result.inspectShortcut = canceled(document.body, 'keydown', KeyboardEvent, { key: 'C', ctrlKey: true, shiftKey: true });
    result.printShortcut = canceled(document.body, 'keydown', KeyboardEvent, { key: 'p', ctrlKey: true });
    result.context = canceled(text, 'contextmenu', MouseEvent);
    result.drag = canceled(text, 'dragstart', DragEvent);
    // A mixed Select All range is also blocked, without a document-wide blanket ban.
    const all = document.createRange(); all.selectNodeContents(document.body); window.getSelection().removeAllRanges(); window.getSelection().addRange(all);
    result.selectAllCopy = canceled(document.body, 'copy', ClipboardEvent);
    select(header);
    result.headerCopy = canceled(document.body, 'copy', ClipboardEvent);
    result.headerContext = canceled(header, 'contextmenu', MouseEvent);
    result.headerDrag = canceled(header, 'dragstart', DragEvent);
    // Synthetic editable fixtures exercise the exemption without storing or changing a book.
    result.editable = [];
    for (const tag of ['input', 'textarea', 'select', 'div']) {
      const control = document.createElement(tag);
      if (tag === 'div') control.contentEditable = 'true';
      chapter.append(control);
      select(text); // Stale document selections must never block an editable control.
      result.editable.push({ copy: canceled(control, 'copy', ClipboardEvent), cut: canceled(control, 'cut', ClipboardEvent), key: canceled(control, 'keydown', KeyboardEvent, { key: 'c', ctrlKey: true }), context: canceled(control, 'contextmenu', MouseEvent), drag: canceled(control, 'dragstart', DragEvent), selection: getComputedStyle(control).userSelect });
      control.remove();
    }
    window.getSelection().removeAllRanges();
    return result;
  });
  for (const key of ['copy', 'cut', 'ctrlC', 'cmdC', 'ctrlInsert', 'context', 'drag', 'selectAllCopy']) assert.equal(results[key], true, key);
  for (const key of ['inspectShortcut', 'printShortcut', 'headerCopy', 'headerContext', 'headerDrag']) assert.equal(results[key], false, key);
  for (const editable of results.editable) assert.deepEqual(editable, { copy: false, cut: false, key: false, context: false, drag: false, selection: 'text' });
  // Real keyboard events reach the reader's scoped listener, not just synthetic copies.
  await page.evaluate(() => {
    const range = document.createRange(); range.selectNodeContents(document.querySelector('.reader-text p, .reader-text li'));
    window.getSelection().removeAllRanges(); window.getSelection().addRange(range);
    window.__readerCopyKeys = [];
    document.addEventListener('keydown', event => { if (event.key.toLowerCase() === 'c') window.__readerCopyKeys.push(event.defaultPrevented); }, { capture: true });
  });
  await page.keyboard.press('Control+c'); await page.keyboard.press('Meta+c');
  assert.deepEqual(await page.evaluate(() => window.__readerCopyKeys), [true, true]);
  await page.evaluate(() => window.getSelection().removeAllRanges());

  await page.emulateMedia({ media: 'print' });
  assert.ok(await chapters.evaluateAll(nodes => nodes.every(el => getComputedStyle(el).display === 'none')));
  assert.notEqual(await page.locator('header').evaluate(el => getComputedStyle(el).display), 'none');
  await page.pdf({ path: path.join(process.env.TEMP, 'learntm-reader-protected-print.pdf') });
  await page.emulateMedia({ media: 'screen' });
  assert.ok(await chapters.first().isVisible());

  const settings = page.getByRole('button', { name: 'კითხვის პარამეტრები', exact: true });
  await settings.focus(); await page.keyboard.press('Enter');
  const root = page.locator('[data-reader-theme]');
  const size = Number(await root.getAttribute('data-reader-size'));
  await page.getByRole('button', { name: 'შრიფტის გაზრდა', exact: true }).click();
  assert.equal(Number(await root.getAttribute('data-reader-size')), size + 1);
  const range = page.getByRole('slider', { name: 'გვერდის სიგანე', exact: true });
  const width = Number(await range.inputValue()); await range.focus(); await page.keyboard.press('ArrowRight');
  assert.equal(Number(await range.inputValue()), width + 1);
  await page.getByRole('button', { name: 'მუქი', exact: true }).click();
  assert.equal(await root.getAttribute('data-reader-theme'), 'dark');
  await page.keyboard.press('Escape');
  assert.ok(await settings.evaluate(el => el === document.activeElement));

  const toc = page.locator('.reader-toc button');
  await toc.first().click();
  await page.waitForFunction(number => document.querySelector(`[data-reader-page="${number}"]`).getBoundingClientRect().top >= 0, book.pages[0].number);
  if (book.pages.length > 1) {
    await page.keyboard.press('ArrowRight');
    await page.waitForURL(`**/books/${book.slug}/${book.pages[1].number}`);
  }
  await page.setViewportSize({ width: 390, height: 844 });
  assert.ok(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await page.getByRole('button', { name: /სარჩევის (დამალვა|ჩვენება)/ }).click();
  const drawer = page.getByRole('dialog', { name: 'სარჩევი', exact: true }); await drawer.waitFor();
  await drawer.locator('ol button').first().click(); await drawer.waitFor({ state: 'hidden' });
  // Client navigation unmounts the reader and removes all document-level listeners.
  await page.locator(`header a[href="/books/${book.slug}"]`).click();
  await page.waitForURL(`**/books/${book.slug}`); await page.waitForLoadState('networkidle');
  for (const route of [`/books/${book.slug}`, '/books', '/blog/ra-aris-transtsendentuli-meditatsia', '/stress-and-anxiety']) {
    if (new URL(page.url()).pathname !== route) await page.goto(`${base}${route}`);
    await page.waitForLoadState('networkidle');
    assert.equal(await page.locator('[data-book-content]').count(), 0);
    const content = page.locator('main p').first();
    assert.notEqual(await content.evaluate(el => getComputedStyle(el).userSelect), 'none');
    assert.deepEqual(await content.evaluate(el => {
      const range = document.createRange(); range.selectNodeContents(el); window.getSelection().removeAllRanges(); window.getSelection().addRange(range);
      return ['copy', 'contextmenu', 'dragstart'].map(type => { const event = new Event(type, { bubbles: true, cancelable: true }); el.dispatchEvent(event); return event.defaultPrevented; });
    }), [false, false, false]);
    await page.emulateMedia({ media: 'print' }); assert.ok(await content.isVisible()); await page.emulateMedia({ media: 'screen' });
  }
  assert.deepEqual(errors, []);
  console.log('Passed: reader-only pointer/clipboard/keyboard/context/drag restrictions, mixed selections, editable exemptions, readable accessibility tree, print exclusion/PDF, reader settings/keyboard/TOC/mobile, cleanup and unrestricted catalog/article/research content.');
} finally { await browser.close(); }
