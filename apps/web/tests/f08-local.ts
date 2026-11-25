// Local SQL Server only. Creates/restores/drops exclusively UUID-named test DBs.
import assert from 'node:assert/strict';
import { randomUUID, randomBytes, createHash } from 'node:crypto';
import { execFileSync, spawn, type ChildProcess } from 'node:child_process';
import { createServer } from 'node:net';
import { mkdir, mkdtemp, readFile, writeFile, rm, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { nextRequestContext } from './next-request-context';

async function main() {
  process.loadEnvFile('.env');
  const source = process.env.DATABASE_URL!;
  assert.match(source, /^sqlserver:\/\/(localhost|127\.0\.0\.1):1434;/i);
  const out = process.env.F08_EVIDENCE_DIR!;
  assert.ok(out && path.isAbsolute(out));
  assert.ok(path.relative(path.resolve('../..'), out).startsWith('..'), 'Evidence outside release/workspace');
  await mkdir(out, { recursive: true });
  const token = randomUUID().replaceAll('-', '');
  const name = `tm_f08_test_${token}`, restoredName = `tm_f08_restore_${token}`;
  const connection = (database: string) => source.replace(/database=[^;]+/i, `database=${database}`);
  assert.notEqual(connection(name), source);
  const admin = new PrismaClient({ datasourceUrl: connection('master'), log: [] });
  const db = new PrismaClient({ datasourceUrl: connection(name), log: [] });
  const restored = new PrismaClient({ datasourceUrl: connection(restoredName), log: [] });
  const temporary = await mkdtemp(path.join(tmpdir(), 'learntm-f08-'));
  const backup = `/var/opt/mssql/data/f08_recovery_${token}.bak`;
  const raw = path.join(temporary, 'synthetic.bak');
  const originalFetch = globalThis.fetch;
  let server: ChildProcess | undefined;
  let serverLog = '';
  const nextEnvBefore = await readFile('next-env.d.ts');
  let deliveries = 0, deliveryMode: 'fail' | 'network' | 'invalid' | 'ok' = 'fail';
  try {
    Object.assign(process.env, { NODE_ENV: 'test', DATABASE_URL: connection(name), PRIVACY_STORAGE_DIR: temporary,
      PRIVACY_BACKUP_KEY: randomBytes(32).toString('base64'), AUTH_SECRET: 'f08-synthetic-only-secret-at-least-32-characters',
      AZURE_STORAGE_ACCOUNT: 'synthetic', PRIVACY_EMAIL_DELIVERY_ENABLED: 'true',
      RESEND_API_KEY: 'synthetic-not-a-key', CORPORATE_FROM_EMAIL: 'sender@example.invalid',
      ADMIN_EMAIL: 'operator@example.invalid', SITE_URL: 'https://example.invalid' });
    delete process.env.MEETINGS_FROM_EMAIL;
    // Real mail is impossible: fetch is intercepted before any handler imports.
    globalThis.fetch = async (url, options) => {
      assert.equal(url, 'https://api.resend.com/emails');
      deliveries++;
      const body = JSON.parse(String(options?.body));
      assert.deepEqual(body.to, ['operator@example.invalid']);
      assert.equal(body.reply_to, undefined);
      for (const privateValue of ['Synthetic Person', 'Synthetic Org', 'inquiry@example.invalid', 'PRIVATE SYNTHETIC BODY']) assert.ok(!body.text.includes(privateValue));
      assert.match(body.text, /https:\/\/example.invalid\/admin\/privacy#corporate-/);
      if (deliveryMode === 'network') throw new Error('synthetic network outage');
      if (deliveryMode === 'fail') return Response.json({}, { status: 503 });
      if (deliveryMode === 'invalid') return Response.json({});
      return Response.json({ id: 'synthetic-receipt' });
    };
    (globalThis as typeof globalThis & { prisma?: PrismaClient }).prisma = db;
    await admin.$executeRawUnsafe(`CREATE DATABASE [${name}]`);
    execFileSync(process.execPath, [path.resolve('node_modules/prisma/build/index.js'), 'migrate', 'deploy'], {
      env: { ...process.env }, stdio: 'pipe', windowsHide: true,
    });
    const diff = execFileSync(process.execPath, [path.resolve('node_modules/prisma/build/index.js'), 'migrate', 'diff',
      '--from-schema-datasource', 'prisma/schema.prisma', '--to-schema-datamodel', 'prisma/schema.prisma', '--script'], {
      env: { ...process.env }, encoding: 'utf8', stdio: 'pipe', windowsHide: true,
    });
    await writeFile(path.join(out, 'schema-diff.sql'), diff);
    assert.ok(!/ALTER TABLE|DROP |CREATE /i.test(diff), 'Migrations and normalized schema must agree');
    const defaultRows = await db.$queryRaw<{ definition: string }[]>`SELECT definition FROM sys.default_constraints WHERE name = 'meeting_registrations_retentionExpiresAt_df'`;
    assert.equal(defaultRows.length, 1);
    assert.equal(defaultRows[0]!.definition, '(dateadd(month,(12),sysutcdatetime()))');
    console.log('F08: fresh migrations and normalized schema comparison passed.');
    const context = await nextRequestContext();
    const { POST } = await import('../src/app/api/corporate-inquiries/route');
    const { corporateContactMethods } = await import('../src/lib/corporate-inquiry');
    const { notifyCorporateInquiry } = await import('../src/server/corporate-notifications');
    const { erasePrivateRecord, reapplyErasureLedger, enforcePrivacyRetention } = await import('../src/server/services/privacy');
    const { readErasureLedger, appendErasure } = await import('../src/server/privacy-files');
    const { encryptBackup, decryptBackup } = await import('../src/server/privacy-backups');
    const input = { name: 'Synthetic Person', organization: 'Synthetic Org', email: 'inquiry@example.invalid',
      phone: '', contactMethod: corporateContactMethods[1], message: 'PRIVATE SYNTHETIC BODY', website: '', startedAt: Date.now() - 5000 };
    const request = () => new Request('https://example.invalid/api/corporate-inquiries', { method: 'POST',
      headers: { origin: 'https://example.invalid', 'content-type': 'application/json' }, body: JSON.stringify(input) });
    const receipt = await context.run(() => POST(request()));
    assert.deepEqual(await receipt.json(), { ok: true });
    const row = await db.corporateInquiry.findFirstOrThrow();
    assert.equal(row.message, input.message);
    assert.equal(deliveries, 0, 'Notification cannot precede durable receipt');
    await context.drain();
    assert.equal((await db.corporateInquiry.findUniqueOrThrow({ where: { id: row.id } })).adminNotifiedAt, null);
    assert.deepEqual(await (await context.run(() => POST(request()))).json(), { ok: true });
    await context.drain();
    assert.equal(await db.corporateInquiry.count(), 1, 'Duplicate request does not create a second record');
    deliveryMode = 'network'; await assert.rejects(notifyCorporateInquiry(row.id, db));
    deliveryMode = 'invalid'; await assert.rejects(notifyCorporateInquiry(row.id, db));
    assert.equal((await db.corporateInquiry.findUniqueOrThrow({ where: { id: row.id } })).adminEmailId, null);
    await db.corporateInquiry.update({ where: { id: row.id }, data: { processingRestrictedAt: new Date() } });
    deliveryMode = 'ok'; const beforeRestriction = deliveries;
    await notifyCorporateInquiry(row.id, db); assert.equal(deliveries, beforeRestriction);
    await db.corporateInquiry.update({ where: { id: row.id }, data: { processingRestrictedAt: null } });
    // Snapshot predates successful delivery and erasure: the independent journal
    // must recover receipt IDs which are absent from this native SQL backup.
    await db.$executeRawUnsafe(`BACKUP DATABASE [${name}] TO DISK=N'${backup}' WITH COPY_ONLY, INIT, CHECKSUM`);
    await admin.$executeRawUnsafe(`RESTORE VERIFYONLY FROM DISK=N'${backup}' WITH CHECKSUM`);
    execFileSync('docker', ['cp', `tm-sqlserver:${backup}`, raw], { stdio: 'pipe', windowsHide: true });
    const bytes = await readFile(raw), encrypted = encryptBackup(bytes);
    const encryptedFile = path.join(temporary, 'synthetic.enc');
    await writeFile(encryptedFile, encrypted);
    assert.deepEqual(decryptBackup(await readFile(encryptedFile)), bytes);
    const corrupt = Buffer.from(encrypted); corrupt[corrupt.length - 1] = corrupt[corrupt.length - 1]! ^ 1;
    assert.throws(() => decryptBackup(corrupt));
    await unlink(raw);
    // Restore only bytes recovered from the encrypted file, not the original.
    await writeFile(raw, decryptBackup(await readFile(encryptedFile)));
    execFileSync('docker', ['cp', raw, `tm-sqlserver:${backup}`], { stdio: 'pipe', windowsHide: true });
    await notifyCorporateInquiry(row.id, db);
    assert.equal((await db.corporateInquiry.findUniqueOrThrow({ where: { id: row.id } })).adminEmailId, 'synthetic-receipt');
    const sent = deliveries; await notifyCorporateInquiry(row.id, db); assert.equal(deliveries, sent);
    await db.corporateInquiry.update({ where: { id: row.id }, data: { holdUntil: new Date(Date.now() + 86400000), holdReason: 'security_incident' } });
    await assert.rejects(erasePrivateRecord(db, 'corporate', row.id));
    await db.corporateInquiry.update({ where: { id: row.id }, data: { holdUntil: null, holdReason: null } });
    await assert.rejects(erasePrivateRecord(db, 'corporate', row.id, { journal: async () => { throw new Error('journal unavailable'); } }));
    assert.ok(await db.corporateInquiry.findUnique({ where: { id: row.id } }), 'Journal failure rolls back SQL deletion');
    await erasePrivateRecord(db, 'corporate', row.id);
    assert.equal(await db.corporateInquiry.count(), 0);
    assert.deepEqual((await readErasureLedger())[0]!.externalEmailIds, ['synthetic-receipt']);
    const task = await db.privacyErasure.findFirstOrThrow();
    assert.equal(task.externalDoneAt, null);
    const files = await db.$queryRaw<{ name: string; type: number }[]>`SELECT name, type FROM sys.database_files ORDER BY file_id`;
    const moves = files.map((file, index) => {
      assert.match(file.name, /^[a-zA-Z0-9_-]+$/);
      return `MOVE N'${file.name}' TO N'/var/opt/mssql/data/${restoredName}_${index}.${file.type === 1 ? 'ldf' : 'mdf'}'`;
    });
    await admin.$executeRawUnsafe(`RESTORE DATABASE [${restoredName}] FROM DISK=N'${backup}' WITH ${moves.join(', ')}, CHECKSUM`);
    await admin.$executeRawUnsafe(`DBCC CHECKDB ([${restoredName}]) WITH NO_INFOMSGS`);
    assert.equal(await restored.corporateInquiry.count(), 1);
    assert.equal(await restored.privacyErasure.count(), 0);
    await restored.corporateInquiry.update({ where: { id: row.id }, data: {
      holdUntil: new Date(Date.now() + 86400000), holdReason: 'security_incident', processingRestrictedAt: new Date(),
    } });
    await reapplyErasureLedger(restored);
    await enforcePrivacyRetention(restored);
    assert.equal(await restored.corporateInquiry.count(), 0);
    const recovered = await restored.privacyErasure.findFirstOrThrow();
    assert.equal(recovered.externalEmailIds, '["synthetic-receipt"]');
    assert.equal(recovered.externalDoneAt, null, 'External copies never silently acknowledged');
    await reapplyErasureLedger(restored);
    assert.equal(await restored.privacyErasure.count(), 1, 'Replay is idempotent');
    await restored.privacyErasure.update({ where: { id: recovered.id }, data: {
      externalEmailIds: '["older-synthetic-receipt"]', externalDoneAt: new Date(),
    } });
    await reapplyErasureLedger(restored);
    const merged = await restored.privacyErasure.findUniqueOrThrow({ where: { id: recovered.id } });
    assert.deepEqual(JSON.parse(merged.externalEmailIds!), ['older-synthetic-receipt', 'synthetic-receipt']);
    assert.equal(merged.externalDoneAt, null, 'Newly recovered receipts require fresh external verification');
    // Legacy entries without receipt IDs remain accepted.
    await appendErasure({ scope: 'corporate', targetId: randomUUID(), deletedAt: new Date().toISOString() });
    await reapplyErasureLedger(restored);
    assert.equal(await restored.privacyErasure.count(), 2);
    console.log('F08: encrypted native restore, stale hold removal, retention and receipt-task replay passed.');
    const { privacyPolicyMarkdown } = await import('../src/content/privacy-policy');
    assert.equal(createHash('sha256').update(privacyPolicyMarkdown).digest('hex'), 'be1de85955075f51ad5347db10d0c058f8eb40541d3506d71c4cdd811851838a');
    // Exercise the real Next request/after lifecycle on a separate host dev server.
    // Reserve/check the port first; never attach tests to an unknown server.
    await new Promise<void>((resolve, reject) => {
      const probe = createServer(); probe.once('error', reject);
      probe.listen(31998, 'localhost', () => probe.close(error => error ? reject(error) : resolve()));
    });
    server = spawn(process.execPath, [path.resolve('node_modules/next/dist/bin/next'), 'dev', '--port', '31998', '--hostname', 'localhost'], {
      windowsHide: true, stdio: ['ignore', 'pipe', 'pipe'], env: { ...process.env,
        NODE_ENV: 'development', ARTICLE_TEST_SERVER: 'true', PRIVACY_EMAIL_DELIVERY_ENABLED: 'false', PRIVACY_LOCAL_BACKUPS: 'false',
        RESEND_API_KEY: '', CORPORATE_FROM_EMAIL: '', ADMIN_EMAIL: '', MEETINGS_FROM_EMAIL: '',
        PRIVACY_LAUNCH_APPROVED: 'false', PRIVACY_BACKUPS_VERIFIED: 'false', PRIVACY_LOG_RETENTION_VERIFIED: 'false',
        PRIVACY_PROCESSORS_VERIFIED: 'false', PRIVACY_EXTERNAL_DELETION_VERIFIED: 'false', PRIVACY_RIGHTS_PROCESS_VERIFIED: 'false',
      },
    });
    server.stdout?.on('data', bytes => { serverLog += String(bytes); });
    server.stderr?.on('data', bytes => { serverLog += String(bytes); });
    server.on('error', () => { serverLog += 'spawn failed'; });
    const base = 'http://localhost:31998';
    const deadline = Date.now() + 120000;
    while (true) {
      if (server.exitCode !== null) throw new Error('Isolated Next exited');
      try { if ((await originalFetch(`${base}/api/meetings`, { signal: AbortSignal.timeout(5000) })).ok) break; } catch { /* starting */ }
      assert.ok(Date.now() < deadline, 'Isolated Next startup deadline');
      await new Promise(resolve => setTimeout(resolve, 500));
    }
    const livePost = () => originalFetch(`${base}/api/corporate-inquiries`, { method: 'POST', signal: AbortSignal.timeout(30000),
      headers: { origin: base, 'content-type': 'application/json' }, body: JSON.stringify({ ...input, email: 'live@example.invalid', startedAt: Date.now() - 5000 }) });
    const liveResponse = await livePost();
    assert.equal(liveResponse.status, 200);
    assert.deepEqual(await liveResponse.json(), { ok: true });
    const liveRow = await db.corporateInquiry.findFirstOrThrow({ where: { email: 'live@example.invalid' } });
    assert.equal(liveRow.message, input.message);
    assert.equal(liveRow.adminNotifiedAt, null, 'Mail is disabled in the real local server');
    assert.equal((await livePost()).status, 200);
    assert.equal(await db.corporateInquiry.count(), 1);
    await db.$executeRawUnsafe('DROP TABLE [dbo].[corporate_inquiries]');
    const databaseFailure = await livePost();
    assert.equal(databaseFailure.status, 503);
    assert.equal((await databaseFailure.json()).ok, undefined);
    await writeFile(path.join(out, 'integration-verification.json'), JSON.stringify({
      isolatedSyntheticData: true, migrationsDeploy: true, schemaDiffEmpty: true, normalizedDefaultUnchanged: true,
      durableCorporateReceipt: true, duplicateSuppression: true, providerFailurePending: true, networkFailurePending: true,
      malformedReceiptPending: true, manualRetry: true, noInquiryContentsInMail: true, restrictionBlocksMail: true,
      holdBlocksErasure: true, journalFailureRollsBack: true, pendingExternalDeletion: true,
      sqlBackupChecksum: true, encryptedDiskReadback: true, tamperRejected: true, fullNativeRestore: true,
      dbccCheckdb: true, restoredRowErased: true, receiptTaskRecoveredFromJournal: true, replayIdempotent: true,
      restoredStaleHoldDoesNotResurrect: true, retentionAfterReplay: true, recoveredReceiptsResetCompletion: true,
      legacyLedgerReadable: true, approvedPolicyHashUnchanged: true, liveNextReceipt: true, liveNextDuplicates: true,
      liveNextDatabaseFailureNoSuccess: true, allLiveAttestationsFalse: true, realMailSent: false, productionApproved: false,
    }, null, 2));
    console.log('F08: isolated corporate SQL/notification/privacy workflow, clean schema comparison, encrypted native SQL restore and independent ledger/task replay passed.');
  } finally {
    if (server) {
      const closed = new Promise<void>(resolve => { if (server!.exitCode !== null) resolve(); else server!.once('close', () => resolve()); });
      // Windows Next spawns its server child. Terminate only this test's process tree.
      if (server.exitCode === null && server.pid) {
        if (process.platform === 'win32') execFileSync('taskkill', ['/PID', String(server.pid), '/T', '/F'], { stdio: 'pipe', windowsHide: true });
        else server.kill('SIGTERM');
      }
      await closed;
      await writeFile(path.join(out, 'isolated-next.log'), serverLog);
      await writeFile('next-env.d.ts', nextEnvBefore);
    }
    globalThis.fetch = originalFetch;
    await db.$disconnect(); await restored.$disconnect();
    for (const database of [restoredName, name]) {
      assert.match(database, /^tm_f08_(test|restore)_[a-f0-9]{32}$/);
      await admin.$executeRawUnsafe(`IF DB_ID('${database}') IS NOT NULL BEGIN ALTER DATABASE [${database}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [${database}]; END`);
    }
    await admin.$disconnect();
    execFileSync('docker', ['exec', 'tm-sqlserver', 'rm', '-f', '--', backup], { stdio: 'pipe', windowsHide: true });
    assert.equal(path.dirname(path.resolve(temporary)), path.resolve(tmpdir()));
    assert.ok(path.basename(temporary).startsWith('learntm-f08-'));
    await rm(temporary, { recursive: true, force: true });
  }
}
main().catch(error => { console.error('F08 isolated test failed:', error instanceof assert.AssertionError ? error.message : error?.name, error?.code || '', error?.stack?.split('\n').filter((line: string) => line.trim().startsWith('at ')).slice(0, 4).join('\n')); process.exitCode = 1; });
