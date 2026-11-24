import assert from 'node:assert/strict';
import console from 'node:console';
import process from 'node:process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { artifacts, connection, database, db, json, readProtected, snapshot } from './local.mjs';
import { backfill, legacyFields } from './backfill.mjs';
import { deletePost, getPublishedPost, savePost } from './archive/legacy-posts.ts';

const rehearsal = process.argv.includes('--rehearsal');
let client = db;
try {
  const backup = JSON.parse(await readFile(path.join(artifacts, 'backup.json'), 'utf8'));
  if (rehearsal) client = new PrismaClient({ datasourceUrl: connection.replace(`database=${database}`, `database=${backup.restoredDatabase}`), log: [] });
  const before = JSON.parse((await readProtected(path.join(artifacts, 'database-before.json'))).toString('utf8'));
  let additionalAuditRecords = [];
  async function compareLegacyTable(table, actual, expected) {
    if (table === 'privacy_audit' && !rehearsal) {
      assert.ok(expected.every(row => actual.includes(row)), 'Every original audit record must remain unchanged');
      additionalAuditRecords = actual.filter(row => !expected.includes(row));
      if (additionalAuditRecords.length) {
        const smoke = JSON.parse(await readFile(path.join(artifacts, 'admin-smoke.json'), 'utf8'));
        assert.equal(additionalAuditRecords.length, smoke.pages.filter(route => route === '/admin/privacy').length, 'Only the expected privacy-page access audit may be appended');
        for (const serialized of additionalAuditRecords) {
          const row = JSON.parse(serialized);
          assert.ok(row.action === 'administration_view' && row.scope === 'rights' && row.targetId === null && Date.parse(row.createdAt) >= Date.parse(backup.createdAt), 'Expected existing privacy access logging');
          const actor = await client.user.findUnique({ where: { id: row.actorId } });
          assert.equal(actor?.role, 'admin');
        }
      }
    } else assert.ok(JSON.stringify(actual) === JSON.stringify(expected), `${table}: original records must match (values omitted from logs)`);
  }
  const after = await snapshot(client);
  for (const [table, records] of Object.entries(before)) {
    if (table === '_prisma_migrations') {
      for (const row of records) assert.ok(after[table].includes(row), 'Existing migration history preserved');
    } else if (table === 'posts') {
      const legacyRows = after[table].map(row => JSON.stringify(legacyFields(JSON.parse(row)))).sort();
      assert.ok(JSON.stringify(legacyRows) === JSON.stringify(records), 'All original post columns preserved exactly');
    } else await compareLegacyTable(table, after[table], records);
  }
  const first = await backfill(client, path.join(artifacts, 'before'));
  assert.deepEqual(await backfill(client, path.join(artifacts, 'before')), first);
  const posts = await client.post.findMany({ include: { revisions: true } });
  assert.equal(posts.length, before.posts.length);
  for (const post of posts) {
    assert.ok(post.revisions.some(revision => revision.id === post.draftRevisionId));
    assert.equal(post.kind, post.slug === 'ra-aris-transtsendentuli-meditatsia' ? 'evergreen' : 'article');
    const revision = post.revisions.find(row => row.id === post.draftRevisionId);
    assert.equal(revision.content, post.content);
    assert.equal(revision.contentFormat, post.contentFormat);
    assert.equal(revision.sourceUpdatedAt.toISOString(), post.updatedAt.toISOString());
  }
  if (rehearsal) {
    // All fixture writes happen only in the isolated restored DB and are rolled back.
    const rollback = new Error('EXPECTED_TEST_ROLLBACK');
    await assert.rejects(client.$transaction(async tx => {
      const author = await tx.user.findFirstOrThrow({ where: { isActive: true } });
      const input = { title: 'Isolated legacy service check', slug: 'isolated-legacy-service-check', excerpt: null, coverImageUrl: null, content: '<p>Legacy HTML</p><script>alert(1)</script>', contentFormat: 'html', status: 'draft' };
      const saved = await savePost(tx, input, { authorId: author.id });
      assert.equal(await getPublishedPost(tx, saved.slug), null);
      await savePost(tx, { ...input, status: 'published' }, { id: saved.id, authorId: author.id });
      const published = await getPublishedPost(tx, saved.slug);
      assert.ok(published);
      assert.equal(published.content, '<p>Legacy HTML</p>');
      await savePost(tx, { ...input, status: 'draft' }, { id: saved.id, authorId: author.id });
      assert.equal(await getPublishedPost(tx, saved.slug), null);
      await savePost(tx, { ...input, status: 'published' }, { id: saved.id, authorId: author.id });
      assert.equal((await getPublishedPost(tx, saved.slug)).publishedAt.toISOString(), published.publishedAt.toISOString());
      await deletePost(tx, saved.id);
      const post = await tx.post.create({ data: { title: 'Isolated constraint check', slug: 'isolated-constraint-check', content: 'Test only', contentFormat: 'markdown' } });
      const revision = await tx.postRevision.create({ data: { postId: post.id, number: 1, sourceHash: 'a'.repeat(64), sourceUpdatedAt: post.updatedAt, title: post.title, content: post.content, contentFormat: 'markdown' } });
      await tx.post.update({ where: { id: post.id }, data: { draftRevisionId: revision.id, draftRevisionPostId: post.id, publishedRevisionId: revision.id, publishedRevisionPostId: post.id } });
      const media = await tx.media.create({ data: { blobName: 'isolated-no-blob', contentType: 'image/png', byteSize: 1, originalName: 'isolated.png' } });
      await tx.postRevisionMedia.create({ data: { revisionId: revision.id, mediaId: media.id } });
      await tx.postSlugAlias.create({ data: { postId: post.id, slug: 'isolated-alias' } });
      // The legacy admin DELETE still removes its post and its foundation-only children.
      await tx.post.delete({ where: { id: post.id } });
      assert.equal(await tx.postRevision.count({ where: { postId: post.id } }), 0);
      assert.equal(await tx.postSlugAlias.count({ where: { postId: post.id } }), 0);
      assert.equal(await tx.postRevisionMedia.count({ where: { mediaId: media.id } }), 0);
      assert.ok(await tx.media.findUnique({ where: { id: media.id } }), 'Deleting a post must retain uploaded media');
      // Existing SQL columns remain writable through the legacy admin update shape.
      const existing = posts[0];
      await tx.post.update({ where: { id: existing.id }, data: { title: existing.title, content: existing.content, contentFormat: existing.contentFormat, status: existing.status } });
      throw rollback;
    }), error => error === rollback);

    // Each failing constraint runs in a separate transaction so SQL Server aborts are isolated.
    const existing = posts[0];
    const revisionId = existing.draftRevisionId;
    await assert.rejects(client.postRevision.update({ where: { id: revisionId }, data: { title: 'Forbidden mutation' } }));
    await assert.rejects(client.postRevision.create({ data: { postId: existing.id, number: 0, sourceHash: 'b'.repeat(64), sourceUpdatedAt: existing.updatedAt, title: existing.title, content: '', contentFormat: 'html' } }));
    await assert.rejects(client.postRevision.create({ data: { postId: existing.id, number: 2, sourceHash: 'c'.repeat(64), sourceUpdatedAt: existing.updatedAt, title: existing.title, content: '', contentFormat: 'document', document: 'invalid', documentVersion: 1 } }));
    await assert.rejects(client.$transaction(async tx => {
      const other = await tx.post.create({ data: { title: 'Isolated owner check', slug: 'isolated-owner-check', content: '' } });
      await tx.post.update({ where: { id: other.id }, data: { publishedRevisionId: revisionId, publishedRevisionPostId: other.id } });
    }));
    await assert.rejects(client.$transaction(async tx => {
      const media = await tx.media.create({ data: { blobName: 'isolated-reference-check', contentType: 'image/png', byteSize: 1, originalName: 'isolated.png' } });
      await tx.postRevisionMedia.create({ data: { revisionId, mediaId: media.id } });
      await tx.media.delete({ where: { id: media.id } });
    }));
  }
  const final = await snapshot(client);
  // Validate the original records again after backfill/constraint checks.
  for (const [table, records] of Object.entries(before)) {
    if (table === '_prisma_migrations') continue;
    const rows = table === 'posts' ? final[table].map(row => JSON.stringify(legacyFields(JSON.parse(row)))).sort() : final[table];
    await compareLegacyTable(table, rows, records);
  }
  await json(path.join(artifacts, rehearsal ? 'rehearsal-passed.json' : 'database-verification.json'), { at: new Date().toISOString(), rehearsal, preservedTables: Object.keys(before), backfilled: first, revisionCount: await client.postRevision.count(), aliases: await client.postSlugAlias.count(), mediaReferences: await client.postRevisionMedia.count(), constraintsVerified: rehearsal, expectedPrivacyAccessAuditRecordsAdded: additionalAuditRecords.length });
  console.log(`${rehearsal ? 'Rehearsal' : 'Local'} verification passed: legacy records, idempotent backfill${rehearsal ? ', ownership/immutability/JSON/media restrictions and legacy deletion' : ''}.`);
} finally { if (client !== db) await client.$disconnect(); await db.$disconnect(); }
