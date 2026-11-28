import assert from 'node:assert/strict';
import { test } from 'node:test';
import { mkdtemp, readFile, rm, unlink, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { tmpdir } from 'node:os';
import { appendErasure, prunePrivacyFiles, readErasureLedger } from '../src/server/privacy-files';

test('journal retries preserve valid entries and reject corrupt pre-existing evidence', async () => {
  const directory = await mkdtemp(path.join(tmpdir(), 'learntm-journal-recovery-'));
  const previous = process.env.PRIVACY_STORAGE_DIR;
  process.env.PRIVACY_STORAGE_DIR = directory;
  try {
    const entry = { scope: 'corporate' as const, targetId: '11111111-1111-4111-8111-111111111111', deletedAt: new Date().toISOString(), externalEmailIds: ['synthetic-receipt'] };
    await appendErasure(entry);
    const file = path.join(directory, 'erasures', `corporate-${entry.targetId}.json`);
    const bytes = await readFile(file);
    await appendErasure(entry); assert.deepEqual(await readFile(file), bytes);
    assert.deepEqual(await readErasureLedger(), [entry]);
    await writeFile(file, JSON.stringify({ ...entry, externalEmailIds: undefined }));
    await appendErasure({ ...entry, deletedAt: new Date(Date.now() + 1000).toISOString() });
    assert.deepEqual(await readErasureLedger(), [entry], 'Retry recovers new receipts without extending journal retention');
    const staged = `${file}.22222222-2222-4222-8222-222222222222.pending`;
    await writeFile(staged, JSON.stringify({ ...entry, deletedAt: new Date(Date.now() - 91 * 86400000).toISOString() }));
    await prunePrivacyFiles(); await assert.rejects(readFile(staged));
    await writeFile(file, '{interrupted');
    await assert.rejects(appendErasure(entry)); await assert.rejects(readErasureLedger());
    await unlink(file);
  } finally {
    if (previous === undefined) delete process.env.PRIVACY_STORAGE_DIR; else process.env.PRIVACY_STORAGE_DIR = previous;
    assert.equal(path.dirname(path.resolve(directory)), path.resolve(tmpdir()));
    assert.ok(path.basename(directory).startsWith('learntm-journal-recovery-'));
    await rm(directory, { recursive: true, force: true });
  }
});
