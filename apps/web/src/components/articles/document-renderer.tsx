import type { PostRevision } from '@prisma/client';
import { articleComponentRegistry, comparisonPropsSchema, svgPropsSchema } from '@/lib/articles/component-registry';
import { articleDocumentSchema, type ArticleDocument } from '@/lib/articles/document';
import { visualAssets } from '@/lib/articles/visual-assets';
import { assetUrl } from '@/server/services/article-revisions';
import { RichContent } from '../rich-content';
import { ArticleContent, ArticleText, articleProseClassName } from '../article-layout';
import { InteractiveVisual } from './interactive-visual';
import styles from './document-renderer.module.css';
import { PreservedSection, PreservedVisual } from './presets';
import intro from '@/app/(site)/blog/[slug]/what-is-tm.module.css';

function SourceLinks({ ids, doc }: { ids: string[]; doc: ArticleDocument }) {
  return ids.length ? <p className={styles.caption}>წყაროები: {ids.map((id, index) => <a key={id} href={`#source-${id}`} className="mr-2">[{doc.sources.findIndex(source => source.id === id) + 1 || index + 1}]</a>)}</p> : null;
}
function Visual({ block, doc }: { block: Extract<ArticleDocument['blocks'][number], { type: 'figure' | 'component' }>; doc: ArticleDocument }) {
  let content;
  if (block.type === 'figure') content = <><img src={assetUrl(block.asset)} alt={block.alt} width={block.width} height={block.height} loading="lazy" />{block.attribution ? <p className={styles.caption}>{block.sourceUrl ? <a href={block.sourceUrl} target="_blank" rel="noopener noreferrer">{block.attribution}</a> : block.attribution}</p> : null}</>;
  else {
    try {
      const reference = articleComponentRegistry.validate(block.reference);
      if (reference.componentId === 'research.svg') {
        const props = svgPropsSchema.parse(reference.props), asset = visualAssets.find(asset => asset.id === props.assetId)!;
        content = <img src={asset.path} alt={props.alt} width={asset.width} height={asset.height} loading="lazy" />;
      } else if (reference.componentId === 'research.comparison') content = <InteractiveVisual data={comparisonPropsSchema.parse(reference.props)} />;
      else if (reference.componentId.startsWith('preserved.')) content = <PreservedVisual reference={reference} />;
      else content = <p>{block.summary}</p>;
    } catch { content = <p role="note">{block.summary}</p>; }
  }
  const align = block.type === 'figure' ? block.align : 'center';
  const alignment = align === 'left' ? styles.left : align === 'right' ? styles.right : align === 'wrap-left' ? styles.wrapLeft : align === 'wrap-right' ? styles.wrapRight : '';
  return <figure id={block.id} className={`${styles.figure} ${alignment}`} style={{ width: `${block.type === 'figure' ? block.widthPercent ?? 100 : 100}%` }}>{content}{block.type === 'component' ? <p className={styles.caption}>{block.summary}</p> : null}{block.caption ? <figcaption className={styles.caption}>{block.caption}</figcaption> : null}<SourceLinks ids={block.sourceIds} doc={doc} /></figure>;
}
export function StructuredDocument({ document }: { document: ArticleDocument }) {
  // Validate shape here, then isolate unavailable component versions per visual.
  const doc = articleDocumentSchema.parse(document);
  if (doc.blocks.some(block => block.type === 'preserved')) return <>{doc.blocks.map(block => block.type === 'preserved' ? <PreservedSection key={block.id} block={block} /> : null)}</>;
  return <><ArticleContent><div className={styles.prose}>{doc.blocks.map(block => {
    if (block.type === 'preserved') return null;
    if (block.type === 'prose') return <ArticleText key={block.id} separated><RichContent content={block.content} format={block.format} className={articleProseClassName} /></ArticleText>;
    if (block.type === 'citation') return <ArticleText key={block.id}><a href={`#source-${block.sourceId}`}>[{block.label}]</a></ArticleText>;
    if (block.type === 'research') return <section key={block.id} id={block.id} className={`${styles.research} ${block.chartSide === 'left' ? styles.chartLeft : ''}`}><RichContent content={block.prose.content} format={block.prose.format} className={articleProseClassName} /><Visual block={block.visual} doc={doc} /></section>;
    return <Visual key={block.id} block={block} doc={doc} />;
  })}</div></ArticleContent>{doc.sources.length ? <section className={styles.references} aria-label="წყაროები"><h2 className="mb-5 text-2xl">წყაროები</h2><ol className="list-decimal space-y-4 pl-6">{doc.sources.map(source => <li key={source.id} id={`source-${source.id}`}>{source.url ? <a href={source.url} target="_blank" rel="noopener noreferrer">{source.title}</a> : source.title}{source.citation ? <p>{source.citation}</p> : null}</li>)}</ol></section> : null}</>;
}
/** This renderer is private-preview only in Phase 3. Public routes are unchanged. */
export function RevisionArticle({ revision }: { revision: PostRevision }) {
  const presentation = revision.presentation ? JSON.parse(revision.presentation) : {};
  if (revision.document && JSON.parse(revision.document).blocks.some((block: { type: string }) => block.type === 'preserved')) {
    const document = JSON.parse(revision.document);
    return revision.layoutKey === 'tm-introduction-v1' ? <article className={intro.page}><StructuredDocument document={document} /></article> : <StructuredDocument document={document} />;
  }
  const crop = ['top', 'bottom'].includes(presentation.coverCrop) ? presentation.coverCrop : 'center';
  return <article data-article-revision={revision.id} className={revision.layoutKey === 'legacy-v1' ? 'mx-auto max-w-4xl px-6' : ''}>
    <header className="mx-auto max-w-4xl px-6 pt-12"><h1 className="text-4xl font-light leading-snug text-plum-800">{revision.displayHeading ?? revision.title}</h1><p className="mt-5 text-sm text-plum-500">{[revision.editorialByline, revision.category].filter(Boolean).join(' · ')}</p></header>
    {revision.coverImageUrl ? <div className="mx-auto mt-10 max-w-5xl px-6"><img src={revision.coverImageUrl} alt={revision.coverImageAlt ?? ''} className="aspect-[16/9] w-full rounded-3xl object-cover" style={{ objectPosition: crop }} /></div> : null}
    {revision.document ? <StructuredDocument document={JSON.parse(revision.document)} /> : <ArticleContent><ArticleText><RichContent content={revision.content} format={revision.contentFormat} className={articleProseClassName} /></ArticleText></ArticleContent>}
  </article>;
}
