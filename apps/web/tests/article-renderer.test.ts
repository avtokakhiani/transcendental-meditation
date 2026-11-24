import assert from 'node:assert/strict';
import { test } from 'node:test';
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { createRequire } from 'node:module';
import type { ArticleDocument } from '../src/lib/articles/document';

Object.assign(globalThis, { React });
// Node tests don't load stylesheets; production/preview still use Next's real CSS modules.
const require = createRequire(import.meta.url);
require.extensions['.css'] = module => { module.exports = {}; };
test('unavailable visual is isolated; prose, citations and escaped fallback survive', async () => {
  const { StructuredDocument } = await import('../src/components/articles/document-renderer');
  const document: ArticleDocument = { version: 1, sources: [{ id: 'study', title: 'Study', url: 'https://example.invalid/study' }], blocks: [
    { type: 'prose', id: 'copy', format: 'html', content: '<p>Preserved article text</p><script>evil()</script>' },
    { type: 'component', id: 'missing', reference: { componentId: 'unavailable.visual', componentVersion: 9, props: {} }, summary: '<script>Readable fallback</script>', sourceIds: ['study'], caption: 'Chart caption' },
    { type: 'citation', id: 'citation', sourceId: 'study', label: '1' },
  ] };
  const html = renderToStaticMarkup(React.createElement(StructuredDocument, { document }));
  assert.match(html, /Preserved article text/); assert.match(html, /Readable fallback/);
  assert.match(html, /href="#source-study"/); assert.match(html, /id="source-study"/);
  assert.match(html, /Chart caption/); assert.ok(!html.includes('<script>')); assert.ok(!html.includes('evil()'));
});
test('interactive visual SSR always has an accessible data fallback and preserves negative values', async () => {
  const { StructuredDocument } = await import('../src/components/articles/document-renderer');
  const document: ArticleDocument = { version: 1, sources: [], blocks: [{ type: 'component', id: 'chart', reference: { componentId: 'research.comparison', componentVersion: 1, props: { title: 'Study comparison', unit: 'mm Hg', rows: [{ label: 'A', value: -11 }] } }, summary: 'Readable summary', sourceIds: [] }] };
  const html = renderToStaticMarkup(React.createElement(StructuredDocument, { document }));
  assert.match(html, /<table/); assert.match(html, /Study comparison/); assert.match(html, /-11/); assert.match(html, /Readable summary/);
});
