import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import { PrismaClient } from '@prisma/client';
import { artifacts, connection, db, snapshot, readProtected, json } from './local.mjs';
const backup = JSON.parse(await readFile(path.join(artifacts, 'backup.json'), 'utf8'));
assert.match(backup.restoredDatabase, /^article_foundation_restore_\d+$/);
const client = new PrismaClient({datasourceUrl: connection.replace(/database=[^;]+/, `database=${backup.restoredDatabase}`)});
try {
  const original = JSON.parse((await readProtected(path.join(artifacts, 'database-before.json'))).toString());
  if (process.argv.includes('--rollback')) {
    assert.deepEqual(await snapshot(client), original, 'Rollback restores every table and record exactly');
    await json(path.join(artifacts, 'rollback-rehearsal.json'), {passed: true, allTablesExactlyRestored: true});
  } else {
    const current = await snapshot();
    for (const table of Object.keys(original)) if (!['posts', 'post_revisions'].includes(table)) assert.deepEqual(current[table], original[table], `Unrelated table changed: ${table}`);
    const ledger = JSON.parse(await readFile(path.join(artifacts, 'migration.json'), 'utf8'));
    const manifest = JSON.parse(await readFile(path.join(artifacts, 'migration-manifest.json'), 'utf8'));
    assert.equal(current.posts.length, original.posts.length + 3);
    assert.equal(current.post_revisions.length, original.post_revisions.length + 7);
    for (const entry of ledger.results) {
      const post = await db.post.findUniqueOrThrow({where: {id: entry.postId}});
      assert.equal(post.version, entry.afterVersion, 'No test edits left in working database');
      assert.equal(post.draftRevisionId, entry.revisionId); assert.equal(post.publishedRevisionId, entry.revisionId);
      const expected = manifest.entries.find(item => item.slug === post.slug);
      const revision = await db.postRevision.findUniqueOrThrow({where: {id: entry.revisionId}});
      assert.equal(revision.document, expected.document, 'Complete migrated body must equal the verified manifest');
      assert.equal(revision.sourceHash, expected.sourceHash);
      assert.equal(post.kind, expected.kind);
      assert.equal(post.publishedAt.toISOString(), new Date(expected.publishedAt).toISOString());
      for (const key of ['title','displayHeading','excerpt','cardTitle','cardExcerpt','editorialByline','category','coverImageUrl','coverImageAlt','seoTitle','seoDescription','readingMinutes']) assert.deepEqual(revision[key], expected[key], `Migrated metadata changed: ${key}`);
      if (!entry.before) assert.equal((await db.postRevision.findFirstOrThrow({where: {postId: post.id, number: 1}})).content, expected.originalHtml, 'Original scientific HTML history retained exactly');
      if (entry.before) for (const key of ['title','slug','excerpt','content','contentFormat','coverImageUrl','status','authorId','publishedAt','createdAt','updatedAt']) assert.equal(JSON.stringify(post[key]), JSON.stringify(entry.before[key]), `Original legacy field changed: ${key}`);
    }
    for (const row of original.post_revisions) assert.ok(current.post_revisions.includes(row), 'Original stored HTML revision must remain byte-for-byte unchanged');
    await json(path.join(artifacts, 'record-verification.json'), {passed: true, posts: 4, migratedBodies: 4, originalIntroductionLegacyFieldsUnchanged: true, originalHtmlHistoryRetained: true, unrelatedTablesUnchanged: true, noWorkingTestRevisions: true});
  }
  console.log('Exact database preservation checks passed.');
} finally {await client.$disconnect(); await db.$disconnect();}
