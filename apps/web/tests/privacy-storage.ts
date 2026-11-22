import assert from 'node:assert/strict';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { mkdtemp, mkdir, writeFile, readFile, utimes, access, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { twelveMonthsAfter, productionPrivacyBlocked } from '../src/lib/privacy-retention';
import { erasePrivateRecord, enforcePrivacyRetention, reapplyErasureLedger } from '../src/server/services/privacy';
import { storeCorporateInquiry } from '../src/server/services/corporate-inquiries';
import { appendErasure, prunePrivacyFiles, readErasureLedger } from '../src/server/privacy-files';

async function main() {
  process.loadEnvFile('.env');
  const temporary = await mkdtemp(path.join(tmpdir(), 'learntm-privacy-test-'));
  process.env.PRIVACY_STORAGE_DIR = temporary;
  const sourceUrl = process.env.DATABASE_URL!;
  const database = `tm_privacy_test_${randomUUID().replaceAll('-', '')}`;
  assert.match(database, /^tm_privacy_test_[a-f0-9]{32}$/);
  assert.ok(/database=[^;]+/i.test(sourceUrl));
  const testUrl = sourceUrl.replace(/database=[^;]+/i, `database=${database}`);
  const admin = new PrismaClient({ datasourceUrl: sourceUrl, log: [] });
  const db = new PrismaClient({ datasourceUrl: testUrl, log: [] });
  try {
    await admin.$executeRawUnsafe(`CREATE DATABASE [${database}]`);
    execFileSync(process.execPath, [path.resolve('node_modules/prisma/build/index.js'), 'migrate', 'deploy'], { env: { ...process.env, DATABASE_URL: testUrl }, stdio: 'pipe' });
    assert.equal(twelveMonthsAfter(new Date('2024-02-29T19:00:00+04:00')).toISOString(), '2025-02-28T15:00:00.000Z');
    assert.equal(twelveMonthsAfter(new Date('2024-02-29T01:00:00+04:00')).toISOString(), '2025-02-27T21:00:00.000Z');
    const readinessKeys = ['NODE_ENV', 'PRIVACY_LAUNCH_APPROVED', 'PRIVACY_BACKUPS_VERIFIED', 'PRIVACY_LOG_RETENTION_VERIFIED', 'PRIVACY_PROCESSORS_VERIFIED', 'PRIVACY_EXTERNAL_DELETION_VERIFIED', 'PRIVACY_RIGHTS_PROCESS_VERIFIED', 'SITE_URL', 'RESEND_API_KEY', 'MEETINGS_FROM_EMAIL', 'CORPORATE_FROM_EMAIL', 'ADMIN_EMAIL'];
    const readinessBefore = Object.fromEntries(readinessKeys.map(key => [key, process.env[key]]));
    try {
      Object.assign(process.env, { NODE_ENV: 'production' }); process.env.PRIVACY_LAUNCH_APPROVED = 'true';
      assert.ok(productionPrivacyBlocked(), 'Approval alone must not enable production collection.');
      for (const key of readinessKeys) if (key.startsWith('PRIVACY_')) process.env[key] = 'true';
      for (const key of ['RESEND_API_KEY', 'MEETINGS_FROM_EMAIL', 'CORPORATE_FROM_EMAIL', 'ADMIN_EMAIL']) process.env[key] = 'test-only';
      process.env.SITE_URL = 'https://example.invalid';
      assert.equal(productionPrivacyBlocked(), false);
      process.env.PRIVACY_EXTERNAL_DELETION_VERIFIED = 'false'; assert.ok(productionPrivacyBlocked());
    } finally { for (const [key, value] of Object.entries(readinessBefore)) { if (value === undefined) delete process.env[key]; else process.env[key] = value; } }
    const now = new Date('2026-11-22T12:00:00Z');
    const meeting = await db.introductoryMeeting.create({ data: { startsAt: new Date('2025-11-22T12:00:00Z'), format: 'online', status: 'closed' } });
    const base = { meetingId: meeting.id, firstName: 'Test', lastName: 'Retention', phone: '+995511111111', retentionExpiresAt: twelveMonthsAfter(meeting.startsAt) };
    const expired = await db.meetingRegistration.create({ data: { ...base, email: 'expired@example.invalid', participantEmailId: 'provider-test-receipt' } });
    const active = await db.meetingRegistration.create({ data: { ...base, email: 'active@example.invalid', retentionExpiresAt: new Date(now.getTime() + 1000) } });
    const held = await db.meetingRegistration.create({ data: { ...base, email: 'held@example.invalid', holdUntil: new Date(now.getTime() + 86400000), holdReason: 'security_incident' } });
    const inquiry = { name: 'Corporate Test', organization: 'Test', email: 'corporate@example.invalid', phone: '', contactMethod: 'ელფოსტით' as const, message: 'Private enquiry', website: '', startedAt: now.getTime() };
    const corporate = await storeCorporateInquiry(db, inquiry, 'test-secret', new Date('2025-11-22T12:00:00Z'));
    const duplicate = await storeCorporateInquiry(db, inquiry, 'test-secret', new Date('2025-11-22T12:00:00Z'));
    assert.equal(corporate.id, duplicate.id);
    const renewed = await storeCorporateInquiry(db, { ...inquiry, email: 'renewed@example.invalid' }, 'test-secret', new Date('2025-11-22T12:00:00Z'));
    await db.corporateInquiry.update({ where: { id: renewed.id }, data: { lastBusinessContactAt: now, retentionExpiresAt: twelveMonthsAfter(now) } });
    await db.privacyAudit.create({ data: { scope: 'rights', action: 'old_test', createdAt: new Date(now.getTime() - 91 * 86400000) } });
    const result = await enforcePrivacyRetention(db, now);
    assert.deepEqual(result, { registrations: 1, corporate: 1 });
    assert.ok(await db.meetingRegistration.findUnique({ where: { id: active.id } }));
    assert.ok(await db.meetingRegistration.findUnique({ where: { id: held.id } }));
    assert.ok(await db.corporateInquiry.findUnique({ where: { id: renewed.id } }));
    await assert.rejects(erasePrivateRecord(db, 'registration', held.id, { now }));
    assert.equal(await db.privacyAudit.count({ where: { action: 'old_test' } }), 0);
    const removal = await db.privacyErasure.findFirstOrThrow({ where: { targetId: expired.id } });
    assert.equal(removal.externalEmailIds, '["provider-test-receipt"]');
    assert.equal((await readErasureLedger()).length, 2);
    // Simulate an old backup restoring an already deleted row, then apply the independent ledger.
    await db.meetingRegistration.create({ data: expired });
    await reapplyErasureLedger(db);
    assert.equal(await db.meetingRegistration.findUnique({ where: { id: expired.id } }), null);
    await erasePrivateRecord(db, 'registration', active.id, { now });
    assert.equal(await db.meetingRegistration.findUnique({ where: { id: active.id } }), null);
    for (const [folder, file, days] of [['backups', 'learntm-backup-expired.enc', 31], ['logs', 'learntm-expired.jsonl', 91]] as const) {
      const directory = path.join(temporary, folder); await mkdir(directory, { recursive: true });
      const filePath = path.join(directory, file); await writeFile(filePath, 'test');
      const past = new Date(now.getTime() - days * 86400000); await utimes(filePath, past, past);
    }
    await appendErasure({ scope: 'registration', targetId: randomUUID(), deletedAt: new Date(now.getTime() - 91 * 86400000).toISOString() });
    const oldLogName = `learntm-${new Date(now.getTime() - 91 * 86400000).toISOString().slice(0, 10)}.jsonl`;
    await writeFile(path.join(temporary, 'logs', oldLogName), 'test');
    await prunePrivacyFiles(now);
    await assert.rejects(access(path.join(temporary, 'backups', 'learntm-backup-expired.enc')));
    await assert.rejects(access(path.join(temporary, 'logs', 'learntm-expired.jsonl')));
    await assert.rejects(access(path.join(temporary, 'logs', oldLogName)));
    assert.equal((await readErasureLedger()).length, 3);
    const { encryptBackup, decryptBackup } = await import('../src/server/privacy-backups');
    process.env.PRIVACY_BACKUP_KEY = randomBytes(32).toString('base64');
    const plaintext = Buffer.from('Private backup roundtrip');
    const encrypted = encryptBackup(plaintext); assert.deepEqual(decryptBackup(encrypted), plaintext);
    encrypted[encrypted.length - 1] = encrypted[encrypted.length - 1]! ^ 1;
    assert.throws(() => decryptBackup(encrypted));
    const { privacyPolicyMarkdown } = await import('../src/content/privacy-policy');
    assert.equal(createHash('sha256').update(privacyPolicyMarkdown).digest('hex'), 'be1de85955075f51ad5347db10d0c058f8eb40541d3506d71c4cdd811851838a', 'Approved policy text must remain byte-for-byte unchanged.');
    console.log('Passed: 12-month anchors/leap days, corporate persistence/deduplication/renewal, early deletion, hold enforcement, 90-day audit/ledger cleanup, 30-day backup cleanup, restore erasure replay, backup encryption/tamper rejection, exact policy text.');
  } finally {
    await db.$disconnect();
    await admin.$executeRawUnsafe(`IF DB_ID('${database}') IS NOT NULL BEGIN ALTER DATABASE [${database}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [${database}]; END`);
    await admin.$disconnect();
    const resolved = path.resolve(temporary);
    assert.equal(path.dirname(resolved), path.resolve(tmpdir()));
    assert.ok(path.basename(resolved).startsWith('learntm-privacy-test-'));
    await rm(resolved, { recursive: true, force: true });
  }
}
main().catch(error => { console.error(error instanceof assert.AssertionError ? error.message : `${error.name}:${error.code || ''}`, error.stack?.split('\n').filter((line: string) => line.trim().startsWith('at ')).slice(0, 3).join('\n')); process.exitCode = 1; });
