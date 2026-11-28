import assert from 'node:assert/strict';
/* global structuredClone */
import { readFile } from 'node:fs/promises';
import { URL } from 'node:url';
import path from 'node:path';
import process from 'node:process';
import console from 'node:console';
import { PrismaClient } from '@prisma/client';
import { chromium } from 'playwright';
import { articles } from './archive/article-catalog.ts';
import { getArticleCardCopy } from './archive/article-card-copy.ts';
import { parseArticleDocument } from '../../src/lib/articles/document.ts';
import { hasLegacyDivergence, legacyToken, projectionToken } from '../../src/server/services/article-revisions.ts';
import { artifacts, db, connection, hash, json, web } from './local.mjs';

const INTRO = 'ra-aris-transtsendentuli-meditatsia';
const mode = process.argv[2] ?? 'plan';
assert.ok(['plan', 'apply', 'rollback'].includes(mode));
const isolated = process.argv.includes('--isolated');
const backup = JSON.parse(await readFile(path.join(artifacts, 'backup.json'), 'utf8'));
assert.ok(backup.verification.includes('Exact restored record comparison for every table'));
assert.equal(hash(await import('./local.mjs').then(async m => m.readProtected(path.join(artifacts, 'database.bak')))), backup.sha256);
assert.match(backup.restoredDatabase, /^article_foundation_restore_\d+$/);
const client = isolated ? new PrismaClient({datasourceUrl: connection.replace(/database=[^;]+/, `database=${backup.restoredDatabase}`), log: []}) : db;
const manifestPath = path.join(artifacts, 'migration-manifest.json');
const source = JSON.parse(await readFile('scripts/article-foundation/phase4-content.json', 'utf8'));
const entryHash = entry => hash(JSON.stringify([entry.slug, entry.metadata, entry.document, entry.originalHtml]));
const ledgerPath = path.join(artifacts, isolated ? 'isolated-migration.json' : 'migration.json');
try {
  for (const [file, digest] of Object.entries(source.sourceFiles)) assert.equal(hash(await readFile(path.join(web, file))), digest, `Original source changed: ${file}`);
  if (mode === 'plan') {
    assert.ok(!isolated);
    const browser = await chromium.launch({channel: 'chrome'}), entries = [];
    try {
      const page = await browser.newPage({viewport: {width: 1440, height: 1000}, reducedMotion: 'reduce'});
      await page.route('**/*', route => new URL(route.request().url()).origin === 'http://localhost:31997' ? route.continue() : route.abort());
      for (const slug of [...articles.map(article => article.slug), INTRO]) {
        const post = await db.post.findUnique({where: {slug}, include: {publishedRevision: true, draftRevision: true}});
        if (post) {
          assert.equal(slug, INTRO, `Collision: ${slug} already exists; explicit reconciliation required`);
          assert.equal(post.draftRevisionId, post.publishedRevisionId, 'Pending editorial draft must be reconciled explicitly');
          assert.equal(hasLegacyDivergence(post, post.publishedRevision), false, 'Legacy/revision divergence must be reconciled explicitly');
        }
        assert.equal(await db.postSlugAlias.count({where: {slug}}), 0, 'Alias collision');
        const response = await page.goto(`http://localhost:31997/blog/${slug}`, {waitUntil: 'networkidle', timeout: 120000});
        assert.equal(response.status(), 200);
        await page.evaluate(() => document.fonts.ready);
        const captured = await page.locator('main#main > article').evaluate(element => ({html: element.outerHTML, heading: element.querySelector('h1')?.textContent, text: element.textContent, images: [...element.querySelectorAll('img')].map(image => ({src: image.getAttribute('src'), alt: image.alt, width: image.getAttribute('width'), height: image.getAttribute('height')}))}));
        const metadata = await page.evaluate(() => ({title: document.title, meta: [...document.querySelectorAll('head meta[name],head meta[property]')].map(meta => ({name: meta.getAttribute('name') ?? meta.getAttribute('property'), content: meta.getAttribute('content')})), canonical: document.querySelector('link[rel="canonical"]')?.getAttribute('href') ?? null}));
        const catalog = articles.find(article => article.slug === slug);
        const keys = catalog ? [slug === articles[0].slug ? 'stress-v1' : slug === articles[1].slug ? 'heart-v1' : 'sleep-v1'] : Object.keys(source.presets).filter(key => key.startsWith('what-is-tm-'));
        const documentData = {version: 1, sources: [], blocks: keys.map((key, index) => {
          const section = structuredClone(source.presets[key]);
          for (const [field, value] of Object.entries(section.fields)) section.fields[field] = value === '__title__' ? captured.heading.trim() : value === '__image.src__' ? catalog.image.src : value === '__image.alt__' ? catalog.image.alt : value;
          return {type: 'preserved', id: `section${index + 1}`, preset: key, ...section, visuals: section.graphs, graphs: undefined};
        })};
        const document = JSON.stringify(documentData);
        parseArticleDocument(document);
        entries.push({slug, kind: catalog ? 'article' : 'evergreen', layoutKey: catalog ? keys[0] : 'tm-introduction-v1',
          expected: post ? {id: post.id, token: legacyToken(post), version: post.version, draftRevisionId: post.draftRevisionId, publishedRevisionId: post.publishedRevisionId} : null,
          title: catalog?.title ?? post.title, excerpt: catalog?.description ?? post.excerpt, cardTitle: getArticleCardCopy(slug)?.title ?? null, cardExcerpt: getArticleCardCopy(slug)?.excerpt ?? null,
          displayHeading: captured.heading.trim(), editorialByline: catalog?.author ?? post.publishedRevision?.editorialByline ?? null, category: catalog?.category ?? post.publishedRevision?.category ?? null,
          publishedAt: catalog?.publishedAt ?? post.publishedAt.toISOString(), readingMinutes: catalog?.readingMinutes ?? post.publishedRevision?.readingMinutes ?? null,
          coverImageUrl: catalog?.image?.src ?? post.coverImageUrl, coverImageAlt: catalog?.image?.alt ?? post.publishedRevision?.coverImageAlt ?? null,
          seoTitle: catalog?.title ?? post.title, seoDescription: metadata.meta.find(meta => meta.name === 'description')?.content ?? null,
          metadata, document, originalHtml: captured.html, captured: {textHash: hash(captured.text), images: captured.images},
        });
      }
    } finally {await browser.close();}
    for (const entry of entries) entry.sourceHash = entryHash(entry);
    await json(manifestPath, {version: 1, phase: 4, sourceFiles: source.sourceFiles, entries});
    await json(path.join(artifacts, 'dry-run.json'), {writesPerformed: false, reconciliation: 'legacy and published snapshot agree; no pending drafts', collisions: [], articles: entries.map(e => ({slug: e.slug, action: e.expected ? 'append structured revision; retain original HTML and public fields' : 'create exact canonical article + HTML history + structured revision', kind: e.kind, sections: JSON.parse(e.document).blocks.length, publicationDate: e.publishedAt, sourceHash: e.sourceHash}))});
    console.log('Dry run complete: 4 full bodies, no collisions or divergence; no records changed.');
  } else if (mode === 'apply') {
    const manifest = JSON.parse(await readFile(manifestPath, 'utf8'));
    assert.deepEqual(manifest.sourceFiles, source.sourceFiles, 'Rebuild manifest after any extraction source change');
    const results = await client.$transaction(async tx => {
      const result = [];
      for (const entry of manifest.entries) {
        assert.equal(entry.sourceHash, entryHash(entry), 'Manifest content integrity');
        parseArticleDocument(entry.document);
        await tx.$queryRaw`SELECT [id] FROM [posts] WITH (UPDLOCK,HOLDLOCK) WHERE [slug]=${entry.slug}`;
        let post = await tx.post.findUnique({where: {slug: entry.slug}, include: {revisions: true}});
        if (post?.revisions.some(revision => revision.sourceHash === entry.sourceHash)) {
          const imported = post.revisions.find(revision => revision.sourceHash === entry.sourceHash);
          assert.equal(post.draftRevisionId, imported.id, 'Imported article has later edits; importer refuses overwrite');
          assert.equal(post.publishedRevisionId, imported.id, 'Imported article has later approved revisions; importer refuses overwrite');
          assert.equal(hasLegacyDivergence(post, imported), false, 'Imported article legacy content changed; explicit reconciliation required');
          assert.equal(post.kind, entry.kind, 'Imported article classification changed');
          assert.equal(post.publishedAt?.toISOString(), new Date(entry.publishedAt).toISOString(), 'Original publication date changed');
          result.push({slug: entry.slug, postId: post.id, revisionId: imported.id, unchanged: true}); continue;
        }
        assert.equal(await tx.postSlugAlias.count({where: {slug: entry.slug}}), 0, 'Alias collision');
        if (entry.expected) {
          assert.ok(post && post.id === entry.expected.id && legacyToken(post) === entry.expected.token && post.version === entry.expected.version && post.draftRevisionId === entry.expected.draftRevisionId && post.publishedRevisionId === entry.expected.publishedRevisionId, 'Existing editorial content changed since plan; abort');
        } else { assert.equal(post, null, `Canonical collision: ${entry.slug}`); }
        const before = post ? {...post, revisions: undefined} : null;
        if (!post) post = await tx.post.create({data: {slug: entry.slug, title: entry.title, excerpt: entry.excerpt, coverImageUrl: entry.coverImageUrl, content: entry.originalHtml, contentFormat: 'html', status: 'published', publishedAt: new Date(entry.publishedAt), kind: 'article'}});
        const metadata = Object.fromEntries(['title','displayHeading','excerpt','cardTitle','cardExcerpt','editorialByline','category','coverImageUrl','coverImageAlt','seoTitle','seoDescription','readingMinutes'].map(key => [key, entry[key]]));
        if (!before) await tx.postRevision.create({data: {...metadata, postId: post.id, number: 1, sourceHash: hash(entry.originalHtml), sourceUpdatedAt: post.updatedAt, content: entry.originalHtml, contentFormat: 'html', layoutKey: 'legacy-v1', presentation: JSON.stringify({version: 1, operation: 'original-source-history', legacyMetadata: entry.metadata})}});
        const last = await tx.postRevision.aggregate({where: {postId: post.id}, _max: {number: true}});
        const revision = await tx.postRevision.create({data: {...metadata, postId: post.id, number: (last._max.number ?? 0) + 1, sourceHash: entry.sourceHash, sourceUpdatedAt: post.updatedAt, content: '', contentFormat: 'document', documentVersion: 1, document: entry.document, layoutKey: entry.layoutKey, presentation: JSON.stringify({version: 1, migrationPhase: 4, migrationSourceHash: entry.sourceHash, operation: 'content-migration', compatibilityFingerprint: projectionToken(post), legacyMetadata: entry.metadata, coverCrop: 'center'})}});
        const after = await tx.post.update({where: {id: post.id}, data: {kind: entry.kind, version: {increment: 1}, draftRevisionId: revision.id, draftRevisionPostId: post.id, publishedRevisionId: revision.id, publishedRevisionPostId: post.id, updatedAt: post.updatedAt}});
        result.push({slug: entry.slug, postId: post.id, revisionId: revision.id, before, afterToken: legacyToken(after), afterVersion: after.version});
      }
      return result;
    }, {timeout: 60000});
    if (results.some(result => !result.unchanged)) await json(ledgerPath, {manifestHash: hash(await readFile(manifestPath)), results});
    else await json(path.join(artifacts, isolated ? 'isolated-idempotency.json' : 'idempotency.json'), {unchanged: true, results});
    console.log(`Migration ${isolated ? 'rehearsal' : 'local'}: ${results.filter(r => !r.unchanged).length} imported, ${results.filter(r => r.unchanged).length} unchanged.`);
  } else {
    assert.ok(isolated || process.argv.includes('--working-rollback'), 'Working rollback requires explicit --working-rollback; never overwrite editorial data automatically');
    const ledger = JSON.parse(await readFile(ledgerPath, 'utf8'));
    await client.$transaction(async tx => {
      for (const row of ledger.results) {
        const post = await tx.post.findUniqueOrThrow({where: {id: row.postId}});
        assert.equal(legacyToken(post), row.afterToken, 'Rollback refuses changed article');
        assert.equal(post.version, row.afterVersion, 'Rollback refuses newer editorial revisions');
        assert.equal(post.draftRevisionId, row.revisionId);
        assert.equal(post.publishedRevisionId, row.revisionId);
        if (!row.before) await tx.post.delete({where: {id: post.id}});
        else {
          const {id, createdAt, updatedAt, publishedAt, ...data} = row.before;
          await tx.post.update({where: {id}, data: {...data, createdAt: new Date(createdAt), updatedAt: new Date(updatedAt), publishedAt: publishedAt ? new Date(publishedAt) : null}});
          await tx.postRevision.delete({where: {id: row.revisionId}});
        }
      }
    }, {timeout: 60000});
    console.log(`Guarded ${isolated ? 'isolated' : 'explicit local working'} rollback completed; compare every table with backup snapshot.`);
  }
} finally { await client.$disconnect(); if (client !== db) await db.$disconnect(); }
