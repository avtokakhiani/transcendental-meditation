import assert from 'node:assert/strict';
import { randomBytes, randomUUID, createHash } from 'node:crypto';
import { spawnSync } from 'node:child_process';
import { mkdir, mkdtemp, readFile, readdir, rename, rm, unlink, utimes, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { PrismaClient } from '@prisma/client';
import { BlobServiceClient } from '@azure/storage-blob';

async function main() {
  process.loadEnvFile('.env');
  const originalUrl = process.env.DATABASE_URL!;
  assert.match(originalUrl, /^sqlserver:\/\/(localhost|127\.0\.0\.1):1434;/i);
  const storage = process.env.AZURE_STORAGE_CONNECTION_STRING!;
  const endpoint = /(?:^|;)BlobEndpoint=([^;]+)/i.exec(storage)?.[1];
  assert.ok(endpoint && /^http:\/\/(localhost|127\.0\.0\.1):10010\//.test(endpoint), 'Local Azurite only');
  const out = process.env.F11_EVIDENCE_DIR!;
  assert.ok(out && path.isAbsolute(out) && path.relative(path.resolve('../..'), out).startsWith('..'));
  await mkdir(out, { recursive: true });
  const temporary = await mkdtemp(path.join(tmpdir(), 'learntm-f11-'));
  const token = randomUUID().replaceAll('-', ''), database = `tm_f11_test_${token}`;
  const connection = (name: string) => originalUrl.replace(/database=[^;]+/i, `database=${name}`);
  assert.notEqual(connection(database), originalUrl);
  const admin = new PrismaClient({ datasourceUrl: connection('master'), log: [] });
  const db = new PrismaClient({ datasourceUrl: connection(database), log: [] });
  const blob = BlobServiceClient.fromConnectionString(storage);
  const source = blob.getContainerClient(`f11-source-${token}`), target = blob.getContainerClient(`f11-restore-${token}`);
  const key = randomBytes(32).toString('base64');
  const digest = (bytes: Buffer) => createHash('sha256').update(bytes).digest('hex');
  try {
    Object.assign(process.env, { NODE_ENV: 'test', DATABASE_URL: connection(database), PRIVACY_STORAGE_DIR: temporary,
      PRIVACY_BACKUP_KEY: key, PRIVACY_LOCAL_BACKUPS: 'false', PRIVACY_EMAIL_DELIVERY_ENABLED: 'false' });
    (globalThis as typeof globalThis & { prisma?: PrismaClient }).prisma = db;
    const { encryptBackup, decryptBackup, ensureLocalPrivacyBackup, verifyLocalPrivacyBackups } = await import('../src/server/privacy-backups');
    const { appendErasure, readErasureLedger, prunePrivacyFiles } = await import('../src/server/privacy-files');
    const directory = path.join(temporary, 'backups'); await mkdir(directory);
    await assert.rejects(verifyLocalPrivacyBackups(), 'Empty backup set must fail');
    const fresh = path.join(directory, `learntm-backup-${Date.now()}-fixture.enc`);
    const payload = Buffer.from('synthetic authenticated fixture, not a SQL restore claim');
    await writeFile(fresh, encryptBackup(payload));
    const originalCipher = await readFile(fresh);
    assert.equal((await verifyLocalPrivacyBackups()).recent, 1);
    process.env.PRIVACY_BACKUP_KEY = randomBytes(32).toString('base64');
    assert.throws(() => decryptBackup(originalCipher));
    await assert.rejects(verifyLocalPrivacyBackups());
    process.env.PRIVACY_BACKUP_KEY = key;
    const future = path.join(directory, `learntm-backup-${Date.now() + 86400000}-fixture.enc`);
    await writeFile(future, originalCipher); await assert.rejects(verifyLocalPrivacyBackups()); await unlink(future);
    for (const damaged of [Buffer.from('LTMB1'), originalCipher.subarray(0, 20), Buffer.concat([originalCipher, Buffer.from('tamper')])]) {
      await writeFile(fresh, damaged); await assert.rejects(verifyLocalPrivacyBackups());
    }
    await writeFile(fresh, encryptBackup(Buffer.alloc(0))); await assert.rejects(verifyLocalPrivacyBackups());
    await writeFile(fresh, originalCipher);
    const stale = path.join(directory, `learntm-backup-${Date.now() - 2 * 86400000}-fixture.enc`);
    await rename(fresh, stale); await utimes(stale, new Date(), new Date());
    await assert.rejects(verifyLocalPrivacyBackups(), 'Copying/touching stale files cannot establish freshness');
    const expired = path.join(directory, `learntm-backup-${Date.now() - 31 * 86400000}-fixture.enc`);
    await writeFile(expired, originalCipher); await assert.rejects(verifyLocalPrivacyBackups());
    const unrelated = path.join(directory, 'owner-evidence.keep'); await writeFile(unrelated, 'preserve');
    await prunePrivacyFiles(); await assert.rejects(readFile(expired)); assert.equal(await readFile(unrelated, 'utf8'), 'preserve');
    await unlink(stale);
    await writeFile(fresh, originalCipher);
    const cli = (args: string[]) => spawnSync(process.execPath, [path.resolve('node_modules/tsx/dist/cli.mjs'), 'scripts/privacy-maintenance.ts', ...args], {
      encoding: 'utf8', windowsHide: true, env: { ...process.env, NODE_ENV: 'production',
        DATABASE_URL: 'sqlserver://127.0.0.1:1;database=unreachable;user=synthetic;password=synthetic' },
    });
    assert.equal(cli(['--verify-backups']).status, 0, 'Verification must work without SQL or a provisioned ledger');
    assert.notEqual(cli(['--verify-backups', '--backup']).status, 0);
    await unlink(fresh); assert.notEqual(cli(['--verify-backups']).status, 0);
    Object.assign(process.env, { NODE_ENV: 'production' });
    await assert.rejects(readErasureLedger(), 'Missing production ledger is not an empty ledger');
    const { runPrivacyMaintenance } = await import('../src/server/privacy-maintenance');
    await assert.rejects(runPrivacyMaintenance(), 'Startup maintenance must stop on missing production ledger');
    await mkdir(path.join(temporary, 'erasures')); assert.deepEqual(await readErasureLedger(), []);
    const journal = { scope: 'corporate' as const, targetId: randomUUID(), deletedAt: new Date().toISOString(), externalEmailIds: ['synthetic-receipt'] };
    await appendErasure(journal);
    await appendErasure(journal);
    const invalidJournal = { ...journal, targetId: randomUUID() };
    const invalidJournalPath = path.join(temporary, 'erasures', `corporate-${invalidJournal.targetId}.json`);
    await writeFile(invalidJournalPath, '{broken'); await assert.rejects(appendErasure(invalidJournal)); await unlink(invalidJournalPath);
    const restarted = spawnSync(process.execPath, [path.resolve('node_modules/tsx/dist/cli.mjs'), '-e',
      "import {readErasureLedger} from './src/server/privacy-files'; readErasureLedger().then(rows=>console.log(JSON.stringify(rows))).catch(()=>process.exit(1));"],
      { encoding: 'utf8', windowsHide: true, env: { ...process.env } });
    assert.equal(restarted.status, 0); assert.deepEqual(JSON.parse(restarted.stdout), [journal]);
    Object.assign(process.env, { NODE_ENV: 'test' });
    // Exercise the existing native helper only on this tiny synthetic database.
    await admin.$executeRawUnsafe(`CREATE DATABASE [${database}]`);
    await db.$executeRawUnsafe('CREATE TABLE [dbo].[f11_fixture] ([id] INT NOT NULL PRIMARY KEY)');
    await db.$executeRawUnsafe('INSERT INTO [dbo].[f11_fixture] VALUES (1)');
    await ensureLocalPrivacyBackup();
    const first = (await readdir(directory)).filter(name => name.endsWith('.enc'));
    assert.equal(first.length, 1); assert.ok(decryptBackup(await readFile(path.join(directory, first[0]!))).length > 0);
    await ensureLocalPrivacyBackup();
    assert.equal((await readdir(directory)).filter(name => name.endsWith('.enc')).length, 1, 'Verified recent backup skips repeat creation');
    await writeFile(path.join(directory, first[0]!), 'interrupted ciphertext');
    await ensureLocalPrivacyBackup();
    assert.equal((await readdir(directory)).filter(name => name.endsWith('.enc')).length, 2, 'Corrupt recent file cannot suppress fresh backup');
    await assert.rejects(verifyLocalPrivacyBackups(), 'Corruption must remain visible until operator quarantine');
    await rename(path.join(directory, first[0]!), path.join(directory, `${first[0]}.corrupt`));
    assert.equal((await verifyLocalPrivacyBackups()).recent, 1);
    assert.equal((await readdir(directory)).filter(name => name.endsWith('.pending') || name.endsWith('.bak')).length, 0);
    const pending = path.join(directory, `learntm-backup-${Date.now() - 2 * 3600000}-${randomUUID()}.enc.pending`);
    await writeFile(pending, 'synthetic interrupted staging'); await ensureLocalPrivacyBackup(); await assert.rejects(readFile(pending));
    // A separate ephemeral container pair rehearses media byte/metadata recovery.
    // It does not create a backup service or claim Azure versioning is configured.
    await source.create(); await target.create();
    const image = Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+aF1cAAAAASUVORK5CYII=', 'base64');
    const sourceBlob = source.getBlockBlobClient('synthetic/fixture.png');
    await sourceBlob.uploadData(image, { metadata: { purpose: 'f11synthetic' }, blobHTTPHeaders: { blobContentType: 'image/png' } });
    const properties = await sourceBlob.getProperties();
    const manifest = { blobName: 'synthetic/fixture.png', bytes: (await sourceBlob.downloadToBuffer()).toString('base64'),
      sha256: digest(image), contentType: properties.contentType, metadata: properties.metadata };
    const mediaFile = path.join(temporary, 'synthetic-media.enc'); await writeFile(mediaFile, encryptBackup(Buffer.from(JSON.stringify(manifest))));
    await sourceBlob.delete();
    const recovered = JSON.parse(decryptBackup(await readFile(mediaFile)).toString());
    const recoveredBytes = Buffer.from(recovered.bytes, 'base64'); assert.equal(digest(recoveredBytes), recovered.sha256);
    const restoredBlob = target.getBlockBlobClient(recovered.blobName);
    await restoredBlob.uploadData(recoveredBytes, { metadata: recovered.metadata, blobHTTPHeaders: { blobContentType: recovered.contentType } });
    assert.deepEqual(await restoredBlob.downloadToBuffer(), image);
    assert.equal((await restoredBlob.getProperties()).contentType, 'image/png');
    assert.equal((await restoredBlob.getProperties()).metadata?.purpose, 'f11synthetic');
    await writeFile(path.join(out, 'verification.json'), JSON.stringify({
      emptyBackupsFail: true, wrongKeyFails: true, corruptionTruncationEmptyFail: true, touchedStaleFails: true,
      expiredBackupsDetectedAndPruned: true, unrelatedFilesPreserved: true, verificationCliReadOnlyWithoutSql: true,
      mixedVerifyMutateRejected: true, futureBackupRejected: true, missingProductionLedgerFailsStartup: true, provisionedEmptyLedgerAccepted: true,
      flushedLedgerReadableAcrossProcessRestart: true,
      realSyntheticSqlHelperChecksumReadback: true, recentVerifiedSkipsCreation: true, corruptRecentDoesNotSuppressBackup: true,
      incompleteFilesNotAdvertised: true, interruptedStagingCleaned: true, syntheticMediaEncryptedRecovery: true,
      mediaBytesHashAndMetadataMatch: true, existingFullSqlRestoreAndReplayEvidenceReused: true, productionReady: false,
    }, null, 2));
    console.log('F11 targeted checks passed: read-only verification, freshness/integrity, local SQL helper, ledger startup failure and isolated encrypted media recovery.');
  } finally {
    await db.$disconnect();
    assert.match(database, /^tm_f11_test_[a-f0-9]{32}$/);
    await admin.$executeRawUnsafe(`IF DB_ID('${database}') IS NOT NULL BEGIN ALTER DATABASE [${database}] SET SINGLE_USER WITH ROLLBACK IMMEDIATE; DROP DATABASE [${database}]; END`);
    await admin.$disconnect();
    for (const container of [source, target]) {
      assert.match(container.containerName, /^f11-(source|restore)-[a-f0-9]{32}$/);
      await container.deleteIfExists();
    }
    assert.equal(path.dirname(path.resolve(temporary)), path.resolve(tmpdir())); assert.ok(path.basename(temporary).startsWith('learntm-f11-'));
    await rm(temporary, { recursive: true, force: true });
  }
}
main().catch(error => { console.error('F11 verification failed:', error instanceof assert.AssertionError ? error.message : error?.name,
  error?.code || '', error?.stack?.split('\n').filter((line: string) => line.trim().startsWith('at ')).slice(0, 3).join('\n')); process.exitCode = 1; });
