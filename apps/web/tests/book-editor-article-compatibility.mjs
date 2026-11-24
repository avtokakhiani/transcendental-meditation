import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import process from 'node:process';
import console from 'node:console';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';
process.loadEnvFile('.env');
const backup = JSON.parse(await readFile(`private/article-foundation/${process.env.ARTICLE_BACKUP_RUN ?? 'phase3-2026-11-24'}/backup.json`, 'utf8'));
assert.match(backup.restoredDatabase, /^article_foundation_restore_\d+$/);
const db = new PrismaClient({ datasourceUrl: process.env.DATABASE_URL.replace(/database=[^;]+/, `database=${backup.restoredDatabase}`), log: [] });
const browser = await chromium.launch({ channel: 'chrome' });
let original;
try {
  original = await db.bookPage.findFirstOrThrow();
  const user = await db.user.findFirstOrThrow({ where: { isActive: true } });
  const base = 'http://localhost:31998', context = await browser.newContext();
  const payload = Buffer.from(JSON.stringify({ userId: user.id, expiresAt: Date.now() + 300000 })).toString('base64url');
  await context.addCookies([{ name: 'tm_session', value: `${payload}.${createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url')}`, url: base, httpOnly: true, sameSite: 'Lax' }]);
  const page = await context.newPage(), errors = [];
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(`${base}/admin/books/${original.bookId}/pages/${original.id}`, { waitUntil: 'networkidle' });
  await page.locator('.tiptap').waitFor();
  assert.equal(await page.locator('input[name="content"]').inputValue(), original.content);
  assert.equal(await page.locator('input[name="contentFormat"]').inputValue(), original.contentFormat);
  await page.locator('.tiptap').fill('Isolated book editor compatibility check');
  await page.getByRole('button', { name: 'შენახვა', exact: true }).click();
  await page.waitForURL('**?saved=1');
  const changed = await db.bookPage.findUniqueOrThrow({ where: { id: original.id } });
  assert.equal(changed.contentFormat, 'html'); assert.equal(changed.content, '<p>Isolated book editor compatibility check</p>');
  assert.deepEqual(errors, []);
  console.log('Book editor retains original content on load and saves ordinary HTML with default shared-editor behavior.');
} finally {
  if (original) { const { id, ...data } = original; await db.bookPage.update({ where: { id }, data }); }
  await browser.close(); await db.$disconnect();
}
