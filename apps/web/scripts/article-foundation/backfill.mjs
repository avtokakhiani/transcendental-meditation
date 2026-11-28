import assert from 'node:assert/strict';
import console from 'node:console';
import process from 'node:process';
import { readFile } from 'node:fs/promises';
import path from 'node:path';
import { PrismaClient } from '@prisma/client';
import { artifacts, connection, database, db, hash, json } from './local.mjs';

const introSlug = 'ra-aris-transtsendentuli-meditatsia';
const legacySlugs = new Set(['mshvidi-dzili', 'meditatsia-da-urtiertobebi', 'pirveli-kvira', 'stresi-da-kortizoli']);

export function legacyFields(post) {
  return Object.fromEntries(Object.entries(post).filter(([key]) => !['kind', 'version', 'draftRevisionId', 'publishedRevisionId', 'draftRevisionPostId', 'publishedRevisionPostId'].includes(key)));
}

export async function backfill(client, baselineDirectory) {
  return client.$transaction(async tx => {
    const posts = await tx.post.findMany({ include: { author: { select: { firstName: true, lastName: true } } } });
    const result = [];
    for (const { author, ...post } of posts) {
      const sourceHash = hash(JSON.stringify(legacyFields(post)));
      let revision = await tx.postRevision.findUnique({ where: { postId_sourceHash: { postId: post.id, sourceHash } } });
      const isIntro = post.slug === introSlug;
      // Only the local existing introduction has a custom renderer. Never infer body text from it.
      const baseline = isIntro ? JSON.parse(await readFile(path.join(baselineDirectory, `blog__${introSlug}-1440.json`), 'utf8')) : null;
      if (!revision) {
        const latest = await tx.postRevision.aggregate({ where: { postId: post.id }, _max: { number: true } });
        const byline = author ? `${author.firstName} ${author.lastName}` : null;
        const layoutKey = isIntro ? 'tm-introduction-v1' : legacySlugs.has(post.slug) ? 'legacy-v1' : 'standard-v1';
        revision = await tx.postRevision.create({ data: {
          postId: post.id, number: (latest._max.number ?? 0) + 1, sourceHash, sourceUpdatedAt: post.updatedAt,
          title: post.title, excerpt: post.excerpt, coverImageUrl: post.coverImageUrl,
          content: post.content, contentFormat: post.contentFormat,
          editorialByline: byline, createdById: post.authorId, seoTitle: post.title,
          seoDescription: baseline?.metadata.find(meta => meta.name === 'description')?.content ?? post.excerpt,
          displayHeading: baseline?.headings.find(heading => heading.level === 'H1')?.text ?? null,
          layoutKey, document: null, documentVersion: null,
          presentation: JSON.stringify({ version: 1, renderer: layoutKey, canonicalPath: `/blog/${post.slug}`, canonicalTag: baseline?.canonical ?? null,
            customBodyStillInCode: isIntro,
            ...(baseline ? { renderedTextHash: hash(baseline.text), headings: baseline.headings, images: baseline.images } : {}),
          }),
        } });
        const ids = [...new Set([...`${post.coverImageUrl ?? ''} ${post.content}`.matchAll(/\/api\/media\/([0-9a-f-]{36})/gi)].map(match => match[1]))];
        for (const mediaId of ids) {
          assert.ok(await tx.media.findUnique({ where: { id: mediaId } }), 'Cannot snapshot a missing media reference');
          await tx.postRevisionMedia.create({ data: { revisionId: revision.id, mediaId } });
        }
      }
      // Raw SQL deliberately preserves legacy updatedAt. Existing admin readers remain authoritative.
      await tx.$executeRaw`UPDATE [posts] SET [kind] = ${isIntro ? 'evergreen' : 'article'}, [draftRevisionId] = ${revision.id}, [draftRevisionPostId] = ${post.id}, [publishedRevisionId] = ${post.status === 'published' ? revision.id : null}, [publishedRevisionPostId] = ${post.status === 'published' ? post.id : null} WHERE [id] = ${post.id}`;
      const after = await tx.post.findUniqueOrThrow({ where: { id: post.id } });
      assert.deepEqual(legacyFields(after), legacyFields(post), 'Backfill must not change a single legacy field');
      result.push({ postId: post.id, slug: post.slug, revisionId: revision.id, sourceHash, layoutKey: revision.layoutKey });
    }
    return result;
  }, { timeout: 60000 });
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(import.meta.filename)) {
  let client = db;
  try {
    const backup = JSON.parse(await readFile(path.join(artifacts, 'backup.json'), 'utf8'));
    const rehearsal = process.argv.includes('--rehearsal');
    assert.equal(backup.database, database);
    if (rehearsal) client = new PrismaClient({ datasourceUrl: connection.replace(`database=${database}`, `database=${backup.restoredDatabase}`), log: [] });
    const first = await backfill(client, path.join(artifacts, 'before'));
    const second = await backfill(client, path.join(artifacts, 'before'));
    assert.deepEqual(first, second, 'Backfill must be idempotent');
    await json(path.join(artifacts, rehearsal ? 'backfill-rehearsal.json' : 'backfill.json'), first);
    console.log(`${rehearsal ? 'Rehearsal' : 'Local'} backfill: ${first.length} post(s); repeated safely; every legacy field preserved.`);
  } finally { if (client !== db) await client.$disconnect(); await db.$disconnect(); }
}
