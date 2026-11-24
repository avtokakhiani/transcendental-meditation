import assert from 'node:assert/strict';
import { randomUUID } from 'node:crypto';
import { readFile } from 'node:fs/promises';
import { test } from 'node:test';
import { PrismaClient } from '@prisma/client';
import { articleInputSchema, type ArticleInput } from '../src/lib/articles/authoring';
import { ArticleConflict, changeArticle, legacyToken, loadArticleEditor } from '../src/server/services/article-revisions';
import { savePost } from '../src/server/services/posts';

test('isolated revision lifecycle, compatibility, assets, restore and concurrent writers', async () => {
  process.loadEnvFile('.env');
  const source = process.env.DATABASE_URL!;
  assert.match(source, /^sqlserver:\/\/(localhost|127\.0\.0\.1):1434;/);
  const backup = JSON.parse(await readFile(`private/article-foundation/${process.env.ARTICLE_BACKUP_RUN ?? 'phase3-2026-11-24'}/backup.json`, 'utf8'));
  assert.match(backup.restoredDatabase, /^article_foundation_restore_\d+$/);
  const db = new PrismaClient({ datasourceUrl: source.replace(/database=[^;]+/, `database=${backup.restoredDatabase}`), log: [] });
  const slug = `phase3-test-${randomUUID()}`;
  let id: string | undefined;
  const doc = { version: 1, sources: [{ id: 'study', title: 'Isolated test reference', url: 'https://example.invalid/study' }], blocks: [
    { type: 'prose', id: 'copy', format: 'html', content: '<h2>ქართული სათაური</h2><p>English and Georgian <strong>text</strong>.</p><script>bad()</script>' },
    { type: 'research', id: 'research', chartSide: 'left', prose: { type: 'prose', id: 'research-copy', format: 'markdown', content: '**Research text**' }, visual: { type: 'component', id: 'svg', summary: 'Accessible chart summary', sourceIds: ['study'], reference: { componentId: 'research.svg', componentVersion: 1, props: { assetId: 'blood-pressure', alt: 'Blood pressure graph' } } } },
    { type: 'component', id: 'comparison', summary: 'Accessible data table', sourceIds: ['study'], reference: { componentId: 'research.comparison', componentVersion: 1, props: { title: 'Isolated comparison', unit: '%', rows: [{ label: 'A', value: 12 }, { label: 'B', value: -4 }] } } },
    { type: 'citation', id: 'cite', sourceId: 'study', label: '1' },
  ] };
  const input = articleInputSchema.parse({ title: 'Isolated lifecycle', slug, displayHeading: 'Display heading', cardTitle: 'Card', excerpt: 'Excerpt', cardExcerpt: 'Card excerpt', editorialByline: 'Editorial author', category: 'Research', coverImageUrl: '', coverImageAlt: '', coverCrop: 'top', seoTitle: 'SEO title', seoDescription: 'SEO description', layoutKey: 'standard-v1', body: { format: 'document', serialized: JSON.stringify(doc) } });
  try {
    const actor = await db.user.findFirstOrThrow({ where: { isActive: true } });
    const saved = await changeArticle(db, { expectedVersion: 0, expectedLegacyToken: '', actorId: actor.id, intent: 'save', input });
    id = saved.id;
    const command = async (intent: 'save' | 'publish' | 'restore' | 'unpublish' | 'reconcile', nextInput: ArticleInput = input, revisionId?: string) => {
      const post = await db.post.findUniqueOrThrow({ where: { id } });
      return changeArticle(db, { id, expectedVersion: post.version, expectedLegacyToken: legacyToken(post), actorId: actor.id, intent, input: nextInput, revisionId });
    };
    assert.equal((await loadArticleEditor(db, id))!.diverged, false);
    assert.equal((await db.post.findUniqueOrThrow({ where: { id } })).status, 'draft');
    await command('publish');
    const live = await db.post.findUniqueOrThrow({ where: { id } });
    assert.ok(live.publishedAt && live.publishedRevisionId);
    assert.match(live.content, /<strong>Research text<\/strong>/);
    assert.match(live.content, /tm-blood-pressure-chart-en.svg/);
    assert.match(live.content, /<table>/);
    assert.ok(!live.content.includes('<script>'));
    const replacement = { ...input, title: 'Replacement draft' };
    await command('save', replacement);
    const unchanged = await db.post.findUniqueOrThrow({ where: { id } });
    assert.equal(unchanged.title, live.title); assert.equal(unchanged.content, live.content);
    assert.equal(unchanged.updatedAt.toISOString(), live.updatedAt.toISOString());
    assert.equal(unchanged.publishedRevisionId, live.publishedRevisionId);
    assert.equal((await loadArticleEditor(db, id))!.input.title, replacement.title);
    assert.equal((await loadArticleEditor(db, id))!.diverged, false);
    const stale = { id, expectedVersion: unchanged.version, expectedLegacyToken: legacyToken(unchanged), actorId: actor.id, intent: 'save' as const, input: replacement };
    const races = await Promise.allSettled([changeArticle(db, stale), changeArticle(db, stale)]);
    assert.equal(races.filter(r => r.status === 'fulfilled').length, 1);
    assert.ok(races.some(r => r.status === 'rejected' && r.reason instanceof ArticleConflict));
    await command('restore', input, live.publishedRevisionId);
    assert.equal((await db.post.findUniqueOrThrow({ where: { id } })).publishedRevisionId, live.publishedRevisionId);
    await command('unpublish');
    await command('publish');
    assert.equal((await db.post.findUniqueOrThrow({ where: { id } })).publishedAt!.toISOString(), live.publishedAt.toISOString());
    await assert.rejects(savePost(db, { title: 'Old writer', slug, excerpt: null, coverImageUrl: null, content: 'x', contentFormat: 'html', status: 'published' }, { id, authorId: actor.id }));
    await db.post.update({ where: { id }, data: { title: 'External legacy change' } });
    assert.equal((await loadArticleEditor(db, id))!.diverged, true);
    await assert.rejects(command('save'), ArticleConflict);
    await command('reconcile');
    assert.equal((await loadArticleEditor(db, id))!.diverged, false);
    const missingMedia = { ...input, coverImageUrl: `/api/media/${randomUUID()}`, coverImageAlt: 'Missing image' };
    await assert.rejects(command('save', missingMedia));
    await assert.rejects(command('save', { ...input, body: { format: 'document', serialized: JSON.stringify({ ...doc, sources: [] }) } }));
    await assert.rejects(command('save', { ...input, body: { format: 'document', serialized: JSON.stringify({ version: 1, sources: [], blocks: [{ type: 'component', id: 'bad', summary: 'Bad', sourceIds: [], reference: { componentId: 'arbitrary.code', componentVersion: 1, props: { script: 'evil()' } } }] }) } }));
    await assert.rejects(command('restore', input, randomUUID()));
    const intro = await db.post.findUniqueOrThrow({ where: { slug: 'ra-aris-transtsendentuli-meditatsia' } });
    await assert.rejects(changeArticle(db, { id: intro.id, expectedVersion: intro.version, expectedLegacyToken: legacyToken(intro), actorId: actor.id, intent: 'unpublish' }));
    // A failed creation must not leave an empty post behind.
    const count = await db.post.count();
    await assert.rejects(changeArticle(db, { expectedVersion: 0, expectedLegacyToken: '', actorId: actor.id, intent: 'publish', input: { ...input, slug: `${slug}-empty`, body: { format: 'document', serialized: JSON.stringify({ version: 1, sources: [], blocks: [{ type: 'prose', id: 'empty', content: '<p></p>', format: 'html' }] }) } } }));
    await assert.rejects(changeArticle(db, { expectedVersion: 0, expectedLegacyToken: '', actorId: actor.id, intent: 'save', input: { ...input, slug: `${slug}-invalid`, body: { format: 'document', serialized: '{}' } } }));
    assert.equal(await db.post.count(), count);
  } finally {
    if (id) await db.post.delete({ where: { id } });
    assert.equal(await db.post.count({ where: { slug: { startsWith: 'phase3-test-' } } }), 0);
    await db.$disconnect();
  }
});
