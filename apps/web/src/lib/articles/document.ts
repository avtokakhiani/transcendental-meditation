import { z } from 'zod';
import { articleComponentRegistry, componentReferenceSchema, type ComponentRegistry } from './component-registry';
import { preservedDefinitions, preservedFieldsSchema } from './preserved';

export const ARTICLE_DOCUMENT_VERSION = 1;
export const contentKindSchema = z.enum(['article', 'evergreen']);
export const articleLayoutSchema = z.enum(['standard-v1', 'legacy-v1', 'tm-introduction-v1', 'stress-v1', 'heart-v1', 'sleep-v1']);
const id = z.string().max(100).regex(/^[a-zA-Z][a-zA-Z0-9_-]*$/);
export const safeLinkSchema = z.string().max(2048).refine(value => {
  if ([...value].some(character => character.charCodeAt(0) <= 32) || value.includes('\\')) return false;
  if (/^\/(?!\/)/.test(value) || /^#[a-zA-Z0-9_-]+$/.test(value)) return true;
  try { return ['https:', 'http:', 'mailto:', 'tel:'].includes(new URL(value).protocol); }
  catch { return false; }
}, 'Unsupported link');
export const assetSchema = z.discriminatedUnion('kind', [
  z.strictObject({ kind: z.literal('media'), mediaId: z.uuid() }),
  z.strictObject({ kind: z.literal('static'), path: z.string().max(2048).regex(/^\/images\/[a-zA-Z0-9_/-]+\.(?:svg|png|jpg|jpeg|webp|gif)$/).refine(value => !value.includes('..')) }),
]);
const proseSchema = z.strictObject({
  type: z.literal('prose'), id, format: z.enum(['markdown', 'html']), content: z.string().max(400_000),
});
const figureSchema = z.strictObject({
  type: z.literal('figure'), id, asset: assetSchema, alt: z.string().min(1).max(2000),
  caption: z.string().max(4000).optional(), sourceIds: z.array(id).max(100),
  attribution: z.string().max(2000).optional(), sourceUrl: safeLinkSchema.optional(),
  align: z.enum(['left', 'center', 'right', 'wrap-left', 'wrap-right']).optional(),
  widthPercent: z.number().min(10).max(100).optional(),
  width: z.number().int().positive().max(20000), height: z.number().int().positive().max(20000),
});
const componentSchema = z.strictObject({
  type: z.literal('component'), id, reference: componentReferenceSchema,
  widthPercent: z.number().min(10).max(100).optional(),
  align: z.enum(['left', 'center', 'right']).optional(),
  summary: z.string().min(1).max(4000), caption: z.string().max(4000).optional(), sourceIds: z.array(id).max(100),
});
const citationSchema = z.strictObject({ type: z.literal('citation'), id, sourceId: id, label: z.string().min(1).max(100) });
export const articleDocumentSchema = z.strictObject({
  version: z.literal(ARTICLE_DOCUMENT_VERSION),
  blocks: z.array(z.discriminatedUnion('type', [
    proseSchema, figureSchema, componentSchema, citationSchema,
    z.strictObject({ type: z.literal('preserved'), id, preset: z.string().max(100), fields: z.record(z.string(), z.string().max(20000)), visuals: z.array(componentReferenceSchema).max(10) }),
    z.strictObject({
      type: z.literal('research'), id, chartSide: z.enum(['left', 'right']),
      prose: proseSchema, visual: z.discriminatedUnion('type', [figureSchema, componentSchema]),
    }),
  ])).max(500),
  sources: z.array(z.strictObject({ id, title: z.string().min(1).max(2000), url: safeLinkSchema.optional(), citation: z.string().max(4000).optional() })).max(500),
});
export type ArticleDocument = z.infer<typeof articleDocumentSchema>;

/** Enforce limits before recursive Zod parsing. Prose remains inert data and MUST use the
 * existing sanitized HTML/Markdown renderers; JSON validation is not sanitization.
 */
export function validateArticleDocument(input: unknown, registry: ComponentRegistry = articleComponentRegistry): ArticleDocument {
  const pending = [{ value: input, depth: 0 }];
  let count = 0;
  const seen = new Set<object>();
  while (pending.length) {
    const { value, depth } = pending.pop()!;
    if (++count > 20000 || depth > 30) throw new Error('Document complexity limit exceeded');
    if (value && typeof value === 'object') {
      if (seen.has(value)) throw new Error('Document must be acyclic JSON');
      seen.add(value);
      for (const child of Object.values(value)) pending.push({ value: child, depth: depth + 1 });
    }
  }
  if (JSON.stringify(input)?.length > 1_000_000) throw new Error('Document size limit exceeded');
  const doc = articleDocumentSchema.parse(input);
  if (doc.blocks.some(block => block.type === 'preserved')) {
    const sequence = doc.blocks.map(block => block.type === 'preserved' ? block.preset : 'mixed');
    const approved = [['stress-v1'], ['heart-v1'], ['sleep-v1'], ['what-is-tm-intro-v1', 'what-is-tm-not-v1', 'what-is-tm-different-v1', 'what-is-tm-restful-alertness-v1', 'what-is-tm-maharishi-v1', 'what-is-tm-tony-nader-v1']];
    if (!approved.some(layout => JSON.stringify(layout) === JSON.stringify(sequence))) throw new Error('Preserved layout must retain its complete versioned section sequence');
  }
  const sourceIds = new Set<string>();
  for (const source of doc.sources) {
    if (sourceIds.has(source.id)) throw new Error('Duplicate source ID');
    sourceIds.add(source.id);
  }
  const blockIds = new Set<string>();
  const check = (block: ArticleDocument['blocks'][number]) => {
    if (blockIds.has(block.id)) throw new Error('Duplicate block ID');
    blockIds.add(block.id);
    if (block.type === 'component') block.reference = registry.validate(block.reference);
    if (block.type === 'preserved') {
      const preset = preservedDefinitions[block.preset];
      if (!preset) throw new Error('Unknown preserved layout version');
      preservedFieldsSchema(preset.fields).parse(block.fields);
      if (block.visuals.length !== preset.graphs.length) throw new Error('Preserved graphs must remain present');
      block.visuals.forEach((visual, index) => {
        registry.validate(visual);
        if (visual.componentId !== preset.graphs[index]!.id || visual.componentVersion !== 1) throw new Error('Unexpected preserved graph');
      });
    }
    if ('sourceIds' in block) for (const source of block.sourceIds) if (!sourceIds.has(source)) throw new Error('Unknown source reference');
    if (block.type === 'citation' && !sourceIds.has(block.sourceId)) throw new Error('Unknown citation');
    if (block.type === 'research') { check(block.prose); check(block.visual); }
  };
  for (const block of doc.blocks) check(block);
  return doc;
}

export function parseArticleDocument(serialized: string, registry?: ComponentRegistry) {
  if (serialized.length > 1_000_000) throw new Error('Document size limit exceeded');
  return validateArticleDocument(JSON.parse(serialized), registry);
}

export function referencedMedia(doc: ArticleDocument): string[] {
  const ids = new Set<string>();
  for(const value of referencedComponentImages(doc)){const match=/^\/api\/media\/([0-9a-f-]{36})$/i.exec(value);if(match)ids.add(match[1]!);}
  for (const block of doc.blocks) {
    if (block.type === 'preserved') {
      const values = [...Object.values(block.fields), ...block.visuals.flatMap(visual => Object.values(visual.props.fields as Record<string, string>))];
      for (const value of values) { const match = /^\/api\/media\/([0-9a-f-]{36})$/i.exec(value); if (match) ids.add(match[1]!); }
    }
    const visual = block.type === 'research' ? block.visual : block;
    if (visual.type === 'figure' && visual.asset.kind === 'media') ids.add(visual.asset.mediaId);
  }
  return [...ids].sort();
}

/** Developer-owned asset extractors run only after the versioned props schema validates. */
export function referencedComponentImages(doc:ArticleDocument):string[]{
  const images=new Set<string>();
  for(const block of doc.blocks){
    const visual=block.type==='research'?block.visual:block;
    const refs=block.type==='preserved'?block.visuals:visual.type==='component'?[visual.reference]:[];
    for(const reference of refs)for(const image of articleComponentRegistry.imageAssets(reference))images.add(image);
  }
  return [...images].sort();
}
