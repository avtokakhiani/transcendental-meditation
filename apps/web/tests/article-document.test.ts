import assert from 'node:assert/strict';
import { test } from 'node:test';
import { z } from 'zod';
import { createComponentRegistry } from '../src/lib/articles/component-registry';
import { parseArticleDocument, referencedMedia, safeLinkSchema, validateArticleDocument } from '../src/lib/articles/document';
import { validateRevisionBody } from '../src/lib/articles/revision-contract';

const registry = createComponentRegistry([{ id: 'test.comparison', version: 1, label: 'Comparison', accessibility: 'data-table', propsSchema: z.object({ datasetId: z.enum(['approved-study']), variant: z.enum(['bars']) }) }]);
const component = { type: 'component', id: 'chart', reference: { componentId: 'test.comparison', componentVersion: 1, props: { datasetId: 'approved-study', variant: 'bars' } }, summary: 'Readable research comparison', sourceIds: ['study'] };
const document = () => ({ version: 1, blocks: [component], sources: [{ id: 'study', title: 'Original study', url: 'https://example.org/study' }] });

test('versioned documents preserve legacy prose and validated component data', () => {
  const input = { ...document(), blocks: [{ type: 'prose', id: 'copy', format: 'markdown', content: 'ქართული **ტექსტი** and English' }, component] };
  assert.deepEqual(parseArticleDocument(JSON.stringify(input), registry), input);
  assert.deepEqual(validateArticleDocument({ version: 1, blocks: [{ type: 'prose', id: 'html', format: 'html', content: '<p>Approved legacy HTML</p>' }], sources: [] }).blocks[0], { type: 'prose', id: 'html', format: 'html', content: '<p>Approved legacy HTML</p>' });
});

test('unknown document versions, nodes, component versions, props and executable payloads fail closed', () => {
  assert.throws(() => validateArticleDocument({ ...document(), version: 2 }, registry));
  assert.throws(() => validateArticleDocument(document()), /Unregistered/);
  for (const change of [
    { componentId: '../../arbitrary-module' }, { componentId: 'unknown' }, { componentVersion: 2 },
    { props: { datasetId: 'unapproved', variant: 'bars' } },
    { props: { datasetId: 'approved-study', variant: 'bars', onClick: 'alert(1)' } },
    { props: { datasetId: 'approved-study', variant: 'bars', html: '<svg onload="alert(1)">' } },
    { props: { datasetId: 'approved-study', variant: 'bars', callback: () => {} } },
  ]) assert.throws(() => validateArticleDocument({ ...document(), blocks: [{ ...component, reference: { ...component.reference, ...change } }] }, registry));
  assert.throws(() => validateArticleDocument({ ...document(), blocks: [{ type: 'jsx', id: 'bad', content: '<Bad />' }] }, registry));
  assert.throws(() => createComponentRegistry([...registry.list(), ...registry.list()]));
});

test('citations, source IDs and nested block IDs must resolve uniquely', () => {
  assert.throws(() => validateArticleDocument({ ...document(), sources: [] }, registry));
  assert.throws(() => validateArticleDocument({ ...document(), sources: [...document().sources, ...document().sources] }, registry));
  assert.throws(() => validateArticleDocument({ ...document(), blocks: [component, component] }, registry));
  assert.throws(() => validateArticleDocument({ ...document(), blocks: [{ type: 'citation', id: 'cite', sourceId: 'missing', label: '1' }] }, registry));
});

test('media references are collected inside research blocks and SVG is a static asset reference', () => {
  const mediaId = '11111111-1111-4111-8111-111111111111';
  const figure = { type: 'figure', id: 'graph', asset: { kind: 'media', mediaId }, alt: 'Scientific graph', width: 1000, height: 600, sourceIds: [] };
  const doc = validateArticleDocument({ version: 1, blocks: [{ type: 'research', id: 'research', chartSide: 'left', prose: { type: 'prose', id: 'copy', format: 'html', content: '<p>Study</p>' }, visual: figure }], sources: [] });
  assert.deepEqual(referencedMedia(doc), [mediaId]);
  assert.doesNotThrow(() => validateArticleDocument({ version: 1, blocks: [{ ...figure, asset: { kind: 'static', path: '/images/tm-blood-pressure-chart-en.svg' } }], sources: [] }));
  for (const path of ['//evil.org/graph.svg', '/images/../secret.svg', '/images/graph.svg?code=x', 'javascript:alert(1)']) assert.throws(() => validateArticleDocument({ version: 1, blocks: [{ ...figure, asset: { kind: 'static', path } }], sources: [] }));
});

test('links and complexity limits reject malicious or oversized documents', () => {
  for (const value of ['javascript:alert(1)', 'data:text/html,bad', '//evil.org', '/\\evil.org', 'https://example.org/\nscript']) assert.equal(safeLinkSchema.safeParse(value).success, false);
  for (const value of ['/blog/article', '#source', 'https://example.org', 'mailto:info@example.org', 'tel:+995511308939']) assert.equal(safeLinkSchema.safeParse(value).success, true);
  assert.throws(() => parseArticleDocument('x'.repeat(1_000_001)));
  const cyclic: Record<string, unknown> = {}; cyclic.self = cyclic;
  assert.throws(() => validateArticleDocument(cyclic), /acyclic/);
  let nested: unknown = 'leaf'; for (let i = 0; i < 35; i++) nested = { child: nested };
  assert.throws(() => validateArticleDocument(nested), /complexity/);
});

test('revision bodies retain Markdown/HTML verbatim and reject ambiguous or mismatched documents', () => {
  for (const contentFormat of ['markdown', 'html']) {
    const body = { contentFormat, content: '<p>ქართული &amp; English</p>\n', document: null, documentVersion: null };
    assert.deepEqual(validateRevisionBody(body), body);
    assert.throws(() => validateRevisionBody({ ...body, document: '{}' }));
  }
  const body = { contentFormat: 'document', content: '', document: JSON.stringify(document()), documentVersion: 1 };
  assert.deepEqual(validateRevisionBody(body, registry), body);
  assert.throws(() => validateRevisionBody({ ...body, documentVersion: 2 }, registry));
  assert.throws(() => validateRevisionBody({ ...body, content: 'second editable copy' }, registry));
  assert.throws(() => validateRevisionBody({ ...body, document: JSON.stringify({ ...document(), version: 2 }) }, registry));
});
