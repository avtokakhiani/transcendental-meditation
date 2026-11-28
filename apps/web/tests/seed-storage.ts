// Execute the actual Prisma seed against an isolated database, never the site's content.
import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { compare } from 'bcryptjs';

async function main() {
  process.loadEnvFile('.env');
  const sourceUrl = process.env.DATABASE_URL!;
  assert.ok(/database=[^;]+/i.test(sourceUrl));
  const database = `tm_seed_test_${randomUUID().replaceAll('-', '')}`;
  assert.match(database, /^tm_seed_test_[a-f0-9]{32}$/);
  const testUrl = sourceUrl.replace(/database=[^;]+/i, `database=${database}`);
  const admin = new PrismaClient({ datasourceUrl: sourceUrl, log: [] });
  const db = new PrismaClient({ datasourceUrl: testUrl, log: [] });
  const password = 'Synthetic-seed-test-only-123';
  const prisma = (args: string[], seedPassword = '') => execFileSync(process.execPath, [path.resolve('node_modules/prisma/build/index.js'), ...args], {
    env: { ...process.env, DATABASE_URL: testUrl, SEED_ADMIN_PASSWORD: seedPassword }, stdio: 'pipe',
  });
  try {
    await admin.$executeRawUnsafe(`CREATE DATABASE [${database}]`);
    prisma(['migrate', 'deploy']);
    assert.equal(await db.user.count(), 0, 'Migrations do not create accounts');
    assert.equal(await db.post.count(), 0, 'Migrations do not create posts');
    assert.equal(await db.book.count(), 0, 'Migrations do not create books');
    assert.throws(() => prisma(['db', 'seed']), 'Creating an admin requires an explicitly supplied valid password');
    assert.equal(await db.user.count(), 0);
    prisma(['db', 'seed'], password);
    const account = await db.user.findUniqueOrThrow({ where: { username: 'admin' } });
    assert.equal(account.role, 'admin'); assert.equal(account.isActive, true);
    assert.ok(await compare(password, account.passwordHash));
    assert.equal(await db.post.count(), 0, 'Bootstrap does not recreate demo posts');
    assert.equal(await db.book.count(), 0, 'Bootstrap does not create placeholder books');
    assert.equal(await db.bookPage.count(), 0);

    // Match the real introductory slug: even this former seed slug must never be overwritten.
    await db.post.create({ data: { slug: 'ra-aris-transtsendentuli-meditatsia', title: 'Editorial title', content: '<p>Edited editorial content</p>', contentFormat: 'html', status: 'published', publishedAt: new Date('2026-10-20T12:00:00Z'), authorId: account.id } });
    const book = await db.book.create({ data: { slug: 'simshvidis-gza', title: 'Edited book', status: 'published', publishedAt: new Date() } });
    await db.bookPage.create({ data: { bookId: book.id, number: 1, title: 'Edited page', content: 'Keep this page and its identity' } });
    await db.user.update({ where: { id: account.id }, data: { role: 'editor', isActive: false, firstName: 'Edited', passwordHash: 'existing-hash-must-not-change' } });
    const snapshot = async () => ({ users: await db.user.findMany(), posts: await db.post.findMany(), books: await db.book.findMany(), pages: await db.bookPage.findMany() });
    const before = await snapshot();
    prisma(['db', 'seed']); // Existing admin does not require or reset a password.
    prisma(['db', 'seed'], 'Different-synthetic-password-456');
    prisma(['migrate', 'deploy']);
    assert.deepEqual(await snapshot(), before, 'Repeated initialization/migration preserves every field and timestamp');
    assert.equal(await db.post.count(), 1, 'The four deleted demos remain absent');
    const compose = readFileSync('../../docker-compose.yml', 'utf8');
    const command = compose.match(/^ {4}command: .*prisma migrate deploy.*$/m)?.[0];
    assert.ok(command, 'Docker has a migration command');
    assert.ok(!command.includes('seed'), 'Docker migration command never invokes a seed');
    console.log('Passed: migrations, explicit admin bootstrap, password validation, no demo recreation, and exact preservation of existing accounts, editorial posts, books and page IDs/timestamps.');
  } finally {
    await db.$disconnect();
    // This validated, randomly generated test-only name can never identify the site's database.
    await admin.$executeRawUnsafe(`IF DB_ID('${database}') IS NOT NULL BEGIN ALTER DATABASE [${database}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [${database}]; END`);
    await admin.$disconnect();
  }
}

main().catch(() => { console.error('Seed regression test failed; details suppressed to protect database settings.'); process.exitCode = 1; });
