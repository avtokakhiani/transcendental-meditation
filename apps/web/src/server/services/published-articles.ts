import type { Post, PostRevision, PrismaClient } from '@prisma/client';
import { contentToText, excerpt as buildExcerpt, readingMinutes } from '@tm/shared';
import { parseArticleDocument, type ArticleDocument } from '../../lib/articles/document';
import {validatePublicationLayout} from '../../lib/articles/layout-contract';
import { validateRevisionBody } from '../../lib/articles/revision-contract';
import type { PostCard } from './posts';

export interface PublishedArticle {
  id: string; postId: string; slug: string; canonicalSlug: string; isAlias: boolean;
  kind: string; title: string; description: string; author: string; category: string;
  publishedAt: string; readingMinutes: number; image: {src: string; alt: string} | null;
  card: PostCard; revision: PostRevision; document: ArticleDocument | null;
}
type Row = Pick<Post, 'id'|'slug'|'kind'|'status'|'publishedAt'|'publishedRevisionId'|'publishedRevisionPostId'> & {publishedRevision: PostRevision | null};
const select = {id: true, slug: true, kind: true, status: true, publishedAt: true, publishedRevisionId: true, publishedRevisionPostId: true, publishedRevision: true} as const;
const eligibility = (now: Date) => ({status: 'published', publishedAt: {not: null, lte: now}, publishedRevisionId: {not: null}});

function plainText(doc: ArticleDocument): string {
  return doc.blocks.map(block => block.type === 'prose' ? contentToText(block.content, block.format) : block.type === 'research' ? contentToText(block.prose.content, block.prose.format) : block.type === 'preserved' ? Object.values(block.fields).join(' ') : block.type === 'component' ? block.summary : block.type === 'figure' ? block.caption ?? block.alt : '').join('\n');
}
/** No legacy column or draft pointer supplies editorial output. Invalid publication fails closed. */
export function validatedPublishedArticle(row: Row, now = new Date()): PublishedArticle | null {
  const revision = row.publishedRevision;
  if (row.status !== 'published' || !row.publishedAt || row.publishedAt > now || !revision || revision.id !== row.publishedRevisionId || revision.postId !== row.id || row.publishedRevisionPostId !== row.id) return null;
  try {
    const presentation=JSON.parse(revision.presentation??'{}');
    if(presentation.version!==1||presentation.legacyMetadata&&(!Array.isArray(presentation.legacyMetadata.meta)||presentation.legacyMetadata.meta.some((entry:{name:unknown})=>typeof entry.name!=='string')))return null;
    if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(row.slug))return null;
    validateRevisionBody({contentFormat: revision.contentFormat, content: revision.content, document: revision.document, documentVersion: revision.documentVersion});
    const document = revision.document ? parseArticleDocument(revision.document) : null;
    validatePublicationLayout(revision.layoutKey,document,row);
    if (!['article','evergreen'].includes(row.kind) || !revision.title.trim()) return null;
    const text = document ? plainText(document) : contentToText(revision.content, revision.contentFormat as 'html'|'markdown');
    const description = revision.excerpt ?? buildExcerpt(text, 180);
    const title = revision.cardTitle ?? revision.title, cardExcerpt = revision.cardExcerpt ?? description;
    const minutes = revision.readingMinutes ?? readingMinutes(text);
    const image = revision.coverImageUrl ? {src: revision.coverImageUrl, alt: revision.coverImageAlt ?? ''} : null;
    return {id: row.slug, postId: row.id, slug: row.slug, canonicalSlug: row.slug, isAlias: false, kind: row.kind,
      title, description: cardExcerpt, author: revision.editorialByline ?? '', category: revision.category ?? '', image,
      publishedAt: row.publishedAt.toISOString(), readingMinutes: minutes, revision, document,
      card: {id: row.slug, slug: row.slug, title, excerpt: cardExcerpt, coverImageUrl: revision.coverImageUrl, publishedAt: row.publishedAt, readingMinutes: minutes}};
  } catch { return null; }
}
export async function listPublishedArticles(db: PrismaClient, now = new Date()) {
  const rows = await db.post.findMany({where: {...eligibility(now), kind: 'article'}, select, orderBy: [{publishedAt:'desc'},{slug:'asc'}]});
  return rows.map(row => validatedPublishedArticle(row,now)).filter((row): row is PublishedArticle => row !== null)
    .sort((a,b)=>Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||a.slug.localeCompare(b.slug));
}
export async function getPublishedArticle(db: PrismaClient, slug: string, now = new Date()): Promise<PublishedArticle|null> {
  const row = await db.post.findFirst({where: {...eligibility(now),slug},select});
  if (row) {const article=validatedPublishedArticle(row,now);return article&&row.slug!==slug?{...article,isAlias:true}:article;}
  // Aliases never reveal the existence or target of a draft/unpublished/invalid article.
  const alias = await db.postSlugAlias.findUnique({where:{slug},select:{post:{select}}});
  if (!alias) return null;
  const article = validatedPublishedArticle(alias.post,now);
  return article ? {...article,isAlias:true} : null;
}
export function relatedPublishedArticles(currentSlug: string, catalog: readonly PublishedArticle[]) {
  const current = catalog.find(article=>article.slug===currentSlug);
  if (!current) return [];
  return catalog.filter(article=>article.slug!==currentSlug).sort((a,b)=>Number(Boolean(current.category&&b.category===current.category))-Number(Boolean(current.category&&a.category===current.category))||Date.parse(b.publishedAt)-Date.parse(a.publishedAt)||a.slug.localeCompare(b.slug));
}
