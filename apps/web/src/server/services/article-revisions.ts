import { createHash, randomUUID } from 'node:crypto';
import type { Post, PostRevision, Prisma, PrismaClient } from '@prisma/client';
import { marked } from 'marked';
import { contentToText } from '@tm/shared';
import { articles } from '../../content/articles';
import { articleInputSchema, INTRODUCTION_SLUG, type ArticleInput } from '../../lib/articles/authoring';
import { assetSchema, parseArticleDocument, referencedMedia, type ArticleDocument } from '../../lib/articles/document';
import { articleComponentRegistry } from '../../lib/articles/component-registry';
import { visualAssets } from '../../lib/articles/visual-assets';
import { preservedDefinitions } from '../../lib/articles/preserved';
import { sanitizeRichHtml } from '../sanitize';

export class ArticleConflict extends Error {
  constructor(message = 'სტატია სხვა ფანჯარაში შეიცვალა. შეინახეთ თქვენი ტექსტი და განაახლეთ გვერდი.') { super(message); }
}
export class ArticleValidation extends Error {}
const digest = (value: unknown) => createHash('sha256').update(JSON.stringify(value)).digest('hex');
export function legacyToken(post: Post) {
  return digest([post.slug, post.title, post.excerpt, post.coverImageUrl, post.content, post.contentFormat, post.status, post.publishedAt, post.authorId, post.updatedAt]);
}
const escape = (value: string) => value.replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!);
const proseHtml = (content: string, format: string) => sanitizeRichHtml(format === 'markdown' ? marked.parse(content, { async: false }) : content);
const meaningfulProse = (content: string, format: string) => {
  const html = proseHtml(content, format);
  return Boolean(contentToText(html, 'html').trim()) || /<img\b/.test(html);
};
export const assetUrl = (asset: { kind: 'static'; path: string } | { kind: 'media'; mediaId: string }) => asset.kind === 'static' ? asset.path : `/api/media/${asset.mediaId}`;

/** Compatibility projection only. Existing public readers still render their original HTML path.
 * Interactive visuals project to readable data; their React implementations remain preview-only.
 */
export function documentHtml(doc: ArticleDocument): string {
  const sources = (ids: string[]) => ids.map(id => {
    const source = doc.sources.find(s => s.id === id)!;
    return `<p>${source.url ? `<a href="${escape(source.url)}">${escape(source.title)}</a>` : escape(source.title)}</p>`;
  }).join('');
  const block = (item: ArticleDocument['blocks'][number]): string => {
    if (item.type === 'preserved') return Object.values(item.fields).map(value => `<p>${escape(value)}</p>`).join('');
    if (item.type === 'prose') return proseHtml(item.content, item.format);
    if (item.type === 'citation') return sources([item.sourceId]);
    if (item.type === 'research') return block(item.prose) + block(item.visual);
    if (item.type === 'figure') return `<img src="${escape(assetUrl(item.asset))}" alt="${escape(item.alt)}" data-align="${item.align ?? 'center'}" style="width:${item.widthPercent ?? 100}%"><p>${escape(item.caption ?? '')}</p><p>${item.sourceUrl ? `<a href="${escape(item.sourceUrl)}">${escape(item.attribution ?? item.sourceUrl)}</a>` : escape(item.attribution ?? '')}</p>${sources(item.sourceIds)}`;
    const ref = articleComponentRegistry.validate(item.reference);
    let visual = '';
    if (ref.componentId === 'research.svg') {
      const asset = visualAssets.find(asset => asset.id === ref.props.assetId)!;
      visual = `<img src="${asset.path}" alt="${escape(String(ref.props.alt))}">`;
    } else if (ref.componentId === 'research.comparison') {
      const rows = ref.props.rows as { label: string; value: number }[];
      visual = `<h3>${escape(String(ref.props.title))}</h3><table><tbody>${rows.map(row => `<tr><th>${escape(row.label)}</th><td>${row.value} ${escape(String(ref.props.unit))}</td></tr>`).join('')}</tbody></table>`;
    }
    return visual + `<p>${escape(item.summary)}</p><p>${escape(item.caption ?? '')}</p>` + sources(item.sourceIds);
  };
  return sanitizeRichHtml(doc.blocks.map(block).join('') + (doc.sources.length ? `<h2>წყაროები</h2>${sources(doc.sources.map(source => source.id))}` : ''));
}

export function revisionProjection(revision: Pick<PostRevision, 'title' | 'excerpt' | 'coverImageUrl' | 'content' | 'contentFormat' | 'document'>) {
  return { title: revision.title, excerpt: revision.excerpt, coverImageUrl: revision.coverImageUrl,
    content: revision.document ? documentHtml(parseArticleDocument(revision.document)) : revision.content,
    contentFormat: revision.document ? 'html' : revision.contentFormat };
}
export function projectionToken(post: Pick<Post, 'title' | 'excerpt' | 'coverImageUrl' | 'content' | 'contentFormat'>) {
  return digest([post.title, post.excerpt, post.coverImageUrl, post.content, post.contentFormat]);
}
export function hasLegacyDivergence(post: Post, revision: PostRevision | null) {
  if (!revision) return false;
  const compatibility = revision.presentation ? JSON.parse(revision.presentation).compatibilityFingerprint : null;
  try { return projectionToken(post) !== (compatibility ?? projectionToken(revisionProjection(revision))); }
  catch { return true; }
}

export function revisionInput(revision: PostRevision): ArticleInput {
  const presentation = revision.presentation ? JSON.parse(revision.presentation) : {};
  return { title: revision.title, slug: '', displayHeading: revision.displayHeading, cardTitle: revision.cardTitle,
    excerpt: revision.excerpt, cardExcerpt: revision.cardExcerpt, editorialByline: revision.editorialByline,
    category: revision.category, coverImageUrl: revision.coverImageUrl, coverImageAlt: revision.coverImageAlt,
    coverCrop: presentation.coverCrop ?? 'center', seoTitle: revision.seoTitle, seoDescription: revision.seoDescription,
    layoutKey: revision.layoutKey as ArticleInput['layoutKey'],
    body: { format: revision.document ? 'document' : revision.contentFormat as 'html' | 'markdown', serialized: revision.document ?? revision.content },
  };
}

export async function loadArticleEditor(db: PrismaClient, id: string) {
  const post = await db.post.findUnique({ where: { id }, include: { draftRevision: true, publishedRevision: true,
    revisions: { orderBy: { number: 'desc' }, select: { id: true, number: true, createdAt: true, title: true, createdById: true } } } });
  if (!post) return null;
  const input: ArticleInput = post.draftRevision ? revisionInput(post.draftRevision) : {
    title: post.title, slug: post.slug, displayHeading: null, cardTitle: null, excerpt: post.excerpt, cardExcerpt: null,
    editorialByline: null, category: null, coverImageUrl: post.coverImageUrl, coverImageAlt: null,
    coverCrop: 'center', seoTitle: null, seoDescription: null, layoutKey: 'standard-v1',
    body: { format: post.contentFormat as 'html' | 'markdown', serialized: post.content },
  };
  input.slug = post.slug;
  return { post, input, legacyToken: legacyToken(post), diverged: hasLegacyDivergence(post, post.publishedRevision ?? post.draftRevision) };
}

async function validateAssets(tx: Prisma.TransactionClient, input: ArticleInput, doc: ArticleDocument | null) {
  const ids = new Set(doc ? referencedMedia(doc) : []);
  const copies = doc ? doc.blocks.flatMap(b => b.type === 'prose' ? [b] : b.type === 'research' ? [b.prose] : []) : [{ content: input.body.serialized, format: input.body.format }];
  const imageUrls = [...(input.coverImageUrl ? [input.coverImageUrl] : [])];
  for (const copy of copies) {
    const normalized = proseHtml(copy.content, copy.format);
    for (const match of normalized.matchAll(/<img\b[^>]*\bsrc="([^"]*)"/gi)) imageUrls.push(match[1]!);
  }
  for (const url of imageUrls) {
    if (url.startsWith('/api/media/') && !/^\/api\/media\/[0-9a-f-]{36}$/i.test(url)) throw new ArticleValidation('სურათის მისამართი არასწორია. აირჩიეთ სურათი ბიბლიოთეკიდან.');
    if (!/^(https?:\/\/|\/images\/|\/api\/media\/)/i.test(url)) throw new ArticleValidation('სურათის მისამართი დაუშვებელია.');
  }
  for (const url of imageUrls) {
    const match = /^\/api\/media\/([0-9a-f-]{36})$/i.exec(url);
    if (match) { assetSchema.parse({ kind: 'media', mediaId: match[1] }); ids.add(match[1]!); }
  }
  if (ids.size && await tx.media.count({ where: { id: { in: [...ids] } } }) !== ids.size) throw new ArticleValidation('სტატიაში მითითებული სურათი ვერ მოიძებნა.');
  const staticPaths = new Set<string>();
  for (const url of imageUrls) if (url.startsWith('/images/')) staticPaths.add(url);
  if (doc) for (const item of doc.blocks) {
    if (item.type === 'preserved') {
      const spec = preservedDefinitions[item.preset]!;
      for (const [key, field] of Object.entries(spec.fields)) if (field.kind === 'image' && item.fields[key]!.startsWith('/images/')) staticPaths.add(item.fields[key]!);
      item.visuals.forEach((ref, index) => { const fields = ref.props.fields as Record<string, string>; for (const [key, field] of Object.entries(spec.graphs[index]!.fields)) if (field.kind === 'image' && fields[key]!.startsWith('/images/')) staticPaths.add(fields[key]!); });
    }
    const visual = item.type === 'research' ? item.visual : item;
    if (visual.type === 'figure' && visual.asset.kind === 'static') staticPaths.add(visual.asset.path);
  }
  // Only the developer-owned asset directory is addressable. Uploaded SVG remains forbidden.
  const { access } = await import('node:fs/promises');
  const path = await import('node:path');
  for (const asset of staticPaths) {
    if (!/^\/images\/[a-zA-Z0-9_/-]+\.(svg|png|jpe?g|webp|gif)$/.test(asset) || asset.includes('..')) throw new ArticleValidation('სურათის მისამართი დაუშვებელია.');
    try { await access(path.join(process.cwd(), 'public', asset)); } catch { throw new ArticleValidation('სურათის ფაილი ვერ მოიძებნა.'); }
  }
  return [...ids];
}

export interface ArticleCommand {
  id?: string; expectedVersion: number; expectedLegacyToken: string; actorId: string;
  intent: 'save' | 'publish' | 'unpublish' | 'restore' | 'reconcile' | 'delete'; revisionId?: string;
  input?: ArticleInput;
}

export async function changeArticle(db: PrismaClient, command: ArticleCommand) {
  return db.$transaction(async tx => {
    let post: Post;
    if (command.id) {
      // Serialize per-article writers, including revision numbering and pointer publication.
      await tx.$queryRaw`SELECT [id] FROM [posts] WITH (UPDLOCK, HOLDLOCK) WHERE [id] = ${command.id}`;
      post = await tx.post.findUniqueOrThrow({ where: { id: command.id } });
      if (post.version !== command.expectedVersion || legacyToken(post) !== command.expectedLegacyToken) throw new ArticleConflict();
    } else {
      if (!command.input || command.intent !== 'save' && command.intent !== 'publish') throw new ArticleValidation('სტატია ვერ მოიძებნა.');
      const input = articleInputSchema.parse(command.input);
      if (articles.some(article => article.slug === input.slug) || input.slug === INTRODUCTION_SLUG || await tx.postSlugAlias.findUnique({ where: { slug: input.slug } })) throw new ArticleValidation('ეს მისამართი უკვე გამოიყენება.');
      post = await tx.post.create({ data: { title: input.title, slug: input.slug, content: '', contentFormat: 'html', authorId: command.actorId } });
    }
    const currentRevision = await tx.postRevision.findUnique({ where: { id: post.publishedRevisionId ?? post.draftRevisionId ?? '00000000-0000-0000-0000-000000000000' } });
    const provenance = currentRevision?.presentation ? JSON.parse(currentRevision.presentation) : {};
    const migrated = provenance.migrationPhase === 4;
    if (migrated && ['delete', 'unpublish', 'reconcile'].includes(command.intent)) throw new ArticleValidation('მიგრირებული გვერდის საჯარო ცვლილებები შემდეგ ეტაპამდე შეჩერებულია.');
    const protectedPage = post.slug === INTRODUCTION_SLUG && !migrated;
    if (protectedPage && command.intent !== 'save' && command.intent !== 'reconcile') throw new ArticleValidation('ამ გვერდის საჯარო ცვლილებები ცალკე მიგრაციის შემდეგ გახდება ხელმისაწვდომი.');
    const shadow = await tx.postRevision.findUnique({ where: { id: post.publishedRevisionId ?? post.draftRevisionId ?? '00000000-0000-0000-0000-000000000000' } });
    if (command.intent !== 'reconcile' && hasLegacyDivergence(post, shadow)) throw new ArticleConflict('ძველ მონაცემებში გარე ცვლილებაა. ჯერ შეაჯერეთ ვერსიები.');
    if (command.intent === 'delete') {
      await tx.post.delete({ where: { id: post.id } });
      return { id: post.id, version: post.version + 1, revisionId: null };
    }
    if (command.intent === 'unpublish') {
      await tx.post.update({ where: { id: post.id }, data: { status: 'draft', version: { increment: 1 }, updatedAt: post.updatedAt } });
      return { id: post.id, version: post.version + 1, revisionId: post.draftRevisionId };
    }
    let input = command.input;
    if (command.intent === 'restore') {
      const historical = await tx.postRevision.findFirst({ where: { id: command.revisionId, postId: post.id } });
      if (!historical) throw new ArticleValidation('არჩეული ვერსია ვერ მოიძებნა.');
      input = { ...revisionInput(historical), slug: post.slug };
    }
    if (command.intent === 'reconcile') {
      input = { ...(shadow ? revisionInput(shadow) : {
        displayHeading: null, cardTitle: null, cardExcerpt: null, editorialByline: null, category: null,
        coverImageAlt: null, coverCrop: 'center' as const, seoTitle: null, seoDescription: null, layoutKey: 'standard-v1' as const,
      }), title: post.title, slug: post.slug, excerpt: post.excerpt, coverImageUrl: post.coverImageUrl,
      body: { format: post.contentFormat as 'html' | 'markdown', serialized: post.content } };
    }
    const parsed = articleInputSchema.parse(input);
    if (parsed.slug !== post.slug) throw new ArticleValidation('შენახული სტატიის მისამართი ამ ეტაპზე უცვლელია.');
    if (protectedPage && (parsed.body.format === 'document' || parsed.body.serialized !== post.content || parsed.layoutKey !== 'tm-introduction-v1')) throw new ArticleValidation('ამ გვერდის ტექსტი და განლაგება დაცულია ცალკე მიგრაციამდე.');
    if (post.slug !== INTRODUCTION_SLUG && parsed.layoutKey === 'tm-introduction-v1') throw new ArticleValidation('ეს განლაგება დაცული გვერდისთვისაა განკუთვნილი.');
    const doc = parsed.body.format === 'document' ? parseArticleDocument(parsed.body.serialized) : null;
    if (migrated) {
      const original = JSON.parse(currentRevision!.document!);
      if (!doc || parsed.layoutKey !== currentRevision!.layoutKey || JSON.stringify(doc.blocks.map(b => b.type === 'preserved' ? b.preset : null)) !== JSON.stringify(original.blocks.map((b: {preset: string}) => b.preset))) throw new ArticleValidation('მიგრირებული სტატიის სრული სტრუქტურა და განლაგება უნდა შენარჩუნდეს.');
    }
    if (doc) for (const item of doc.blocks) {
      if (item.type === 'prose' && item.format === 'html') item.content = sanitizeRichHtml(item.content);
      if (item.type === 'research' && item.prose.format === 'html') item.prose.content = sanitizeRichHtml(item.prose.content);
    }
    const mediaIds = await validateAssets(tx, parsed, doc);
    if (command.intent === 'publish') {
      if (parsed.coverImageUrl && !parsed.coverImageAlt) throw new ArticleValidation('ყდის სურათს დაუმატეთ ალტერნატიული ტექსტი.');
      const meaningful = doc ? doc.blocks.some(block => block.type === 'prose' ? meaningfulProse(block.content, block.format) : block.type !== 'citation') : meaningfulProse(parsed.body.serialized, parsed.body.format);
      if (!meaningful) throw new ArticleValidation('გამოქვეყნებამდე დაამატეთ სტატიის შინაარსი.');
    }
    const { slug: _slug, body: _body, coverCrop, ...metadata } = parsed;
    void _slug; void _body;
    const last = await tx.postRevision.aggregate({ where: { postId: post.id }, _max: { number: true } });
    const legacyContent = doc ? '' : command.intent === 'reconcile' || protectedPage ? parsed.body.serialized : parsed.body.format === 'html' ? sanitizeRichHtml(parsed.body.serialized) : parsed.body.serialized;
    const compatibilityFingerprint = command.intent === 'publish' && !migrated ? projectionToken({
      title: metadata.title, excerpt: metadata.excerpt, coverImageUrl: metadata.coverImageUrl,
      content: doc ? documentHtml(doc) : legacyContent, contentFormat: doc ? 'html' : parsed.body.format,
    }) : projectionToken(post);
    const revision = await tx.postRevision.create({ data: {
      ...metadata, postId: post.id, number: (last._max.number ?? 0) + 1,
      sourceHash: digest([parsed, randomUUID()]), sourceUpdatedAt: post.updatedAt,
      content: legacyContent,
      contentFormat: doc ? 'document' : parsed.body.format, document: doc ? JSON.stringify(doc) : null, documentVersion: doc ? 1 : null,
      presentation: JSON.stringify({ ...provenance, version: 1, coverCrop, operation: command.intent, compatibilityFingerprint }), createdById: command.actorId,
      mediaReferences: { create: mediaIds.map(mediaId => ({ mediaId })) },
    } });
    const pointers = { draftRevisionId: revision.id, draftRevisionPostId: post.id };
    if (command.intent === 'reconcile') {
      await tx.post.update({ where: { id: post.id }, data: { publishedRevisionId: revision.id, publishedRevisionPostId: post.id,
        ...(post.draftRevisionId ? {} : pointers), version: { increment: 1 }, updatedAt: post.updatedAt } });
    } else if (command.intent === 'publish') {
      if (migrated) {
        await tx.post.update({ where: {id: post.id}, data: {...pointers, publishedRevisionId: revision.id, publishedRevisionPostId: post.id, version: {increment: 1}, updatedAt: post.updatedAt} });
        return {id: post.id, version: post.version + 1, revisionId: revision.id};
      }
      const projection = revisionProjection(revision);
      await tx.post.update({ where: { id: post.id }, data: { ...projection, ...pointers,
        publishedRevisionId: revision.id, publishedRevisionPostId: post.id, status: 'published',
        publishedAt: post.publishedAt ?? new Date(), version: { increment: 1 } } });
    } else await tx.post.update({ where: { id: post.id }, data: { ...pointers, version: { increment: 1 }, updatedAt: post.updatedAt } });
    return { id: post.id, version: post.version + 1, revisionId: revision.id };
  }, { timeout: 60000 });
}
