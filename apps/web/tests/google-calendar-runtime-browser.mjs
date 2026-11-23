/* global process, console */
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createHmac } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { setTimeout as delay } from 'node:timers/promises';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';

process.loadEnvFile('.env');
const db = new PrismaClient({ log: [] });
const browser = await chromium.launch({ channel: 'chrome' });
const corePath = 'src/server/google-calendar-test-core.ts';
const original = await readFile(corePath);
let changed = false;
try {
  const user = await db.user.findFirst({ where: { role: 'admin', isActive: true }, select: { id: true } });
  assert.ok(user);
  const context = await browser.newContext();
  const payload = Buffer.from(JSON.stringify({ userId: user.id, expiresAt: Date.now() + 300000 })).toString('base64url');
  const signed = `${payload}.${createHmac('sha256', process.env.AUTH_SECRET).update(payload).digest('base64url')}`;
  await context.addCookies([{ name: 'tm_session', value: signed, url: 'http://localhost:31997', httpOnly: true, sameSite: 'Lax' }]);
  const anonymous = await browser.newContext();
  assert.equal((await anonymous.request.get('http://localhost:31997/api/admin/calendar-test/runtime')).status(), 401);
  const check = async () => {
  const response = await context.request.get('http://localhost:31997/api/admin/calendar-test/runtime');
  assert.equal(response.status(), 200);
  // Only synthetic fixed timestamps and enum diagnostics are returned. No live run, cookie or credential.
  const diagnostic = await response.json();
  console.log(JSON.stringify(diagnostic));
  assert.equal(diagnostic.loadedEngineMatchesCurrentClass, true);
  assert.equal(diagnostic.implementation, 'owned-write-etag-retry-v4');
  assert.equal(diagnostic.loadedEngine.result, 'write_success');
  assert.equal(diagnostic.loadedEngine.fractionalMilliseconds, 0);
  assert.equal(diagnostic.loadedEngine.verification, 'succeeded');
  assert.equal(diagnostic.loadedEngine.cleanup, 'succeeded');
  for (const probe of [diagnostic.loadedEngine, diagnostic.currentCode]) {
    assert.equal(probe.result, 'write_success');
    assert.equal(probe.deleteAttempts, 2);
    assert.equal(probe.versionConflicts, 1);
    assert.equal(probe.versionChangedAfterConflict, true);
  }
  assert.ok(Object.values(diagnostic.loadedEngine.firstRetrievalChecks).every(value => value === true));
  return diagnostic;
  };
  await check();
  // Trigger a real HMR reevaluation of the core, without altering application behavior.
  changed = true;
  await writeFile(corePath, Buffer.concat([original, Buffer.from('\n// Offline runtime HMR regression probe.\n')]));
  await delay(1000);
  await check();
  await writeFile(corePath, original);
  changed = false;
  await delay(1000);
  await check();
  const page = await context.newPage();
  await page.goto('http://localhost:31997/admin/calendar-test');
  await page.locator('[data-calendar-test-implementation="owned-write-etag-retry-v4"]').waitFor();
  console.log('Current execution verified before HMR, after HMR, and after exact source restoration. No real Calendar requests.');
} finally {
  if (changed) await writeFile(corePath, original);
  await browser.close(); await db.$disconnect();
}
