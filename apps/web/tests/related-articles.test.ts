import assert from 'node:assert/strict';
import { test } from 'node:test';
import { getLatestArticles, type Article } from '../src/content/articles';
import { getRelatedArticles } from '../src/content/related-articles';

const now = new Date('2026-11-18T12:00:00Z');
function article(slug: string, category = 'health', publishedAt = '2026-10-01T00:00:00Z'): Article {
  return {
    slug,
    category,
    publishedAt,
    title: slug,
    description: slug,
    author: '',
    readingMinutes: 1,
    image: null,
  };
}

test('related categories precede newer unrelated catalog articles', () => {
  const result = getRelatedArticles({
    currentSlug: 'current',
    now,
    catalog: [
      article('current'),
      article('related-old'),
      article('related-new', 'health', '2026-10-20T00:00:00Z'),
      article('other', 'sleep', '2026-11-10T00:00:00Z'),
    ],
  });
  assert.deepEqual(
    result.map((item) => item.slug),
    ['related-new', 'related-old', 'other'],
  );
});

test('new catalog publications appear automatically; scheduled and invalid dates are excluded', () => {
  const before = [article('current'), article('older')];
  const after = [
    ...before,
    article('new', 'health', '2026-11-18T11:00:00Z'),
    article('scheduled', 'health', '2026-12-01T00:00:00Z'),
    article('invalid', 'health', 'invalid'),
  ];
  assert.deepEqual(
    getRelatedArticles({ currentSlug: 'current', catalog: before, now }).map((item) => item.slug),
    ['older'],
  );
  assert.deepEqual(
    getRelatedArticles({ currentSlug: 'current', catalog: after, now }).map((item) => item.slug),
    ['new', 'older'],
  );
});

test('current article and duplicate slugs are excluded without filling empty slots', () => {
  const result = getRelatedArticles({
    currentSlug: 'current',
    now,
    catalog: [article('current'), article('other'), article('other')],
  });
  assert.deepEqual(
    result.map((item) => item.slug),
    ['other'],
  );
});

test('unrelated catalog articles fall back to most recent publication', () => {
  const result = getRelatedArticles({
    currentSlug: 'current',
    now,
    catalog: [
      article('current', 'mental-health'),
      article('older'),
      article('newest', 'sleep', '2026-11-17T00:00:00Z'),
    ],
  });
  assert.deepEqual(
    result.map((item) => item.slug),
    ['newest', 'older'],
  );
});

test('separate site/CMS pages and unknown routes are not treated as catalog articles', () => {
  const catalog = getLatestArticles(now);
  assert.deepEqual(
    getRelatedArticles({ currentSlug: 'ra-aris-transtsendentuli-meditatsia', catalog, now }),
    [],
  );
  assert.deepEqual(getRelatedArticles({ currentSlug: 'missing', catalog, now }), []);
  assert.deepEqual(
    getRelatedArticles({ currentSlug: 'current', catalog: [article('current')], now }),
    [],
  );
});

test('actual recommendations are exactly the other published listing entries', () => {
  const catalog = getLatestArticles(now);
  for (const current of catalog) {
    const result = getRelatedArticles({ currentSlug: current.slug, catalog, now });
    assert.deepEqual(
      new Set(result.map((item) => item.slug)),
      new Set(catalog.filter((item) => item.slug !== current.slug).map((item) => item.slug)),
    );
  }
  assert.deepEqual(getLatestArticles(new Date('1970-01-01T00:00:00Z')), []);
});
