/* global URL */
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';
import console from 'node:console';
import process from 'node:process';
import path from 'node:path';
import { chromium } from 'playwright';
import { artifacts, db, json } from './local.mjs';

const base = 'http://localhost:31997';
const browser = await chromium.launch({ channel: 'chrome' });
try {
  const user = await db.user.findFirstOrThrow({ where: { role: 'admin', isActive: true }, select: { id: true } });
  const posts = await db.post.findMany();
  const context = await browser.newContext();
  const payload = Buffer.from(JSON.stringify({ userId: user.id, expiresAt: Date.now() + 300000 })).toString('base64url');
  const signature = createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url');
  await context.addCookies([{ name: 'tm_session', value: `${payload}.${signature}`, url: base, httpOnly: true, sameSite: 'Lax' }]);
  await context.route('**/*', route => new URL(route.request().url()).origin === base && route.request().method() === 'GET' ? route.continue() : route.abort());
  const page = await context.newPage();
  const errors = [], pages = [];
  page.on('pageerror', error => errors.push(error.message));
  for (const route of ['/admin', '/admin/posts', '/admin/posts/new', ...posts.map(post => `/admin/posts/${post.id}`), '/admin/books', '/admin/media', '/admin/meetings', '/admin/privacy', '/admin/calendar-test']) {
    const response = await page.goto(`${base}${route}`, { waitUntil: 'networkidle', timeout: 120000 });
    assert.equal(response.status(), 200, route);
    assert.equal(new URL(page.url()).pathname, route === '/admin' ? '/admin/posts' : route, 'Existing administrator access preserved');
    const post = posts.find(post => route === `/admin/posts/${post.id}`);
    if (post) {
      assert.equal(await page.locator('input[name="title"]').inputValue(), post.title);
      assert.equal(await page.locator('input[name="slug"]').inputValue(), post.slug);
      assert.equal(await page.locator('input[name="content"]').inputValue(), post.content);
      assert.equal(await page.locator('input[name="contentFormat"]').inputValue(), post.contentFormat);
      assert.equal(await page.locator('select[name="status"]').inputValue(), post.status);
      await page.locator('.tiptap[contenteditable="true"]').waitFor();
    }
    pages.push(route);
  }
  const anonymous = await browser.newPage();
  await anonymous.goto(`${base}/admin/posts`);
  assert.equal(new URL(anonymous.url()).pathname, '/admin/login');
  assert.deepEqual(errors, []);
  await json(path.join(artifacts, 'admin-smoke.json'), { pages, errors, note: 'Read-only; no real admin saves, registrations, emails or OAuth requests.' });
  console.log('Existing admin pages, untouched post form values, Tiptap hydration and anonymous access protection passed.');
} finally { await browser.close(); await db.$disconnect(); }
