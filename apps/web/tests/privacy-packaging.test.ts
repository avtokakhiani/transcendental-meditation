import assert from 'node:assert/strict';
import { mkdir, mkdtemp, readFile, rm, symlink, utimes, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test } from 'node:test';
import { resolvePrivacyStorageDirectory } from '../src/server/privacy-storage-path';
import { appendErasure, prunePrivacyFiles, readErasureLedger } from '../src/server/privacy-files';

test('production private storage must be explicitly outside the release, including symlinks', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'learntm-private-path-'));
  try {
    const cwd = path.join(root, 'release/apps/web'), external = path.join(root, 'durable');
    await mkdir(path.join(cwd, 'public'), { recursive: true }); await mkdir(external);
    for (const configured of [undefined, 'relative', path.join(cwd, 'private'), path.join(root, 'release'), root]) {
      assert.throws(() => resolvePrivacyStorageDirectory({ cwd, production: true, configured }));
    }
    assert.equal(resolvePrivacyStorageDirectory({ cwd, production: true, configured: external }), external);
    assert.equal(resolvePrivacyStorageDirectory({ cwd, production: false }), path.join(cwd, 'private'));
    assert.throws(() => resolvePrivacyStorageDirectory({ cwd, production: false, configured: path.join(cwd, 'public/private') }));
    const link = path.join(root, 'looks-external');
    await symlink(path.join(cwd, 'public'), link, process.platform === 'win32' ? 'junction' : 'dir');
    assert.throws(() => resolvePrivacyStorageDirectory({ cwd, production: true, configured: link }));
  } finally {
    assert(path.dirname(root) === path.resolve(os.tmpdir()) && path.basename(root).startsWith('learntm-private-path-'));
    await rm(root, { recursive: true, force: true });
  }
});

test('streamed private directory handling preserves ledger replay and existing retention boundaries', async () => {
  const root = await mkdtemp(path.join(os.tmpdir(), 'learntm-private-files-'));
  const previous = process.env.PRIVACY_STORAGE_DIR;
  process.env.PRIVACY_STORAGE_DIR = root;
  try {
    const now = new Date(), day = 86400000;
    await mkdir(path.join(root, 'backups')); await mkdir(path.join(root, 'logs'));
    const oldBackup = path.join(root, 'backups', `learntm-backup-${now.getTime() - 31 * day}-fixture.enc`);
    const recentBackup = path.join(root, 'backups', `learntm-backup-${now.getTime()}-fixture.enc`);
    const legacy = path.join(root, 'logs', 'learntm-legacy.jsonl');
    await writeFile(oldBackup, 'synthetic'); await writeFile(recentBackup, 'synthetic'); await writeFile(legacy, 'synthetic');
    await utimes(legacy, new Date(now.getTime() - 91 * day), new Date(now.getTime() - 91 * day));
    await writeFile(path.join(root, 'logs', 'operator-evidence.json'), 'retained');
    const entry = { scope: 'corporate' as const, targetId: '11111111-1111-4111-8111-111111111111', deletedAt: now.toISOString() };
    await appendErasure(entry); assert.deepEqual(await readErasureLedger(), [entry]);
    await prunePrivacyFiles(now);
    await assert.rejects(readFile(oldBackup)); await assert.rejects(readFile(legacy));
    assert.equal(await readFile(recentBackup, 'utf8'), 'synthetic');
    assert.equal(await readFile(path.join(root, 'logs', 'operator-evidence.json'), 'utf8'), 'retained');
    assert.deepEqual(await readErasureLedger(), [entry]);
  } finally {
    if (previous === undefined) delete process.env.PRIVACY_STORAGE_DIR; else process.env.PRIVACY_STORAGE_DIR = previous;
    assert(path.dirname(root) === path.resolve(os.tmpdir()) && path.basename(root).startsWith('learntm-private-files-'));
    await rm(root, { recursive: true, force: true });
  }
});
