import type { Prisma, PrismaClient } from '@prisma/client';
import { type ContentFormat, type PostInput, contentToText, excerpt as buildExcerpt, readingMinutes } from '@tm/shared';
import { sanitizeRichHtml } from '../sanitize';

export interface PostCard {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  coverImageUrl: string | null;
  publishedAt: Date | null;
  readingMinutes: number;
}

export interface PostDetail extends PostCard {
  content: string;
  contentFormat: ContentFormat;
  authorName: string | null;
  updatedAt: Date;
}

export interface PostPage<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
}

function publishedWhere(): Prisma.PostWhereInput {
  return { status: 'published', publishedAt: { not: null, lte: new Date() } };
}
const CARD_SELECT = {
  id: true,
  slug: true,
  title: true,
  excerpt: true,
  coverImageUrl: true,
  publishedAt: true,
  content: true,
  contentFormat: true,
} satisfies Prisma.PostSelect;

type CardRow = Prisma.PostGetPayload<{ select: typeof CARD_SELECT }>;

function toCard(row: CardRow): PostCard {
  const format = row.contentFormat as ContentFormat;
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt ?? buildExcerpt(row.content, 180, format),
    coverImageUrl: row.coverImageUrl,
    publishedAt: row.publishedAt,
    readingMinutes: readingMinutes(contentToText(row.content, format)),
  };
}

export async function listPublishedPosts(
  db: PrismaClient,
  pagination: { page?: number; pageSize?: number } = {},
): Promise<PostPage<PostCard>> {
  const page = Math.max(1, pagination.page ?? 1);
  const pageSize = Math.min(50, Math.max(1, pagination.pageSize ?? 9));
  const where = publishedWhere();

  const [total, rows] = await Promise.all([
    db.post.count({ where }),
    db.post.findMany({
      where,
      orderBy: [{ publishedAt: 'desc' }, { id: 'desc' }],
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: CARD_SELECT,
    }),
  ]);

  return { total, page, pageSize, items: rows.map(toCard) };
}

export async function getPublishedPost(db: PrismaClient, slug: string): Promise<PostDetail | null> {
  const row = await db.post.findFirst({
    where: { ...publishedWhere(), slug },
    select: {
      ...CARD_SELECT,
      updatedAt: true,
      author: { select: { firstName: true, lastName: true } },
    },
  });
  if (row === null) return null;

  return {
    ...toCard(row),
    content: row.content,
    contentFormat: row.contentFormat as ContentFormat,
    updatedAt: row.updatedAt,
    authorName: row.author === null ? null : `${row.author.firstName} ${row.author.lastName}`,
  };
}

/** Admin list: every status, newest edits first. */
export async function listAllPosts(db: PrismaClient) {
  return db.post.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, slug: true, title: true, status: true, publishedAt: true, updatedAt: true },
  });
}

export async function getPostForEdit(db: PrismaClient, id: string) {
  return db.post.findUnique({ where: { id } });
}

export async function isPostSlugTaken(db: PrismaClient, slug: string, exceptId?: string) {
  const row = await db.post.findFirst({
    where: { slug, ...(exceptId === undefined ? {} : { id: { not: exceptId } }) },
    select: { id: true },
  });
  return row !== null;
}

export async function savePost(
  db: PrismaClient,
  input: PostInput,
  options: { id?: string; authorId: string },
): Promise<{ id: string; slug: string }> {
  input = { ...input, content: input.contentFormat === 'html' ? sanitizeRichHtml(input.content) : input.content };
  const existing =
    options.id === undefined
      ? null
      : await db.post.findUnique({ where: { id: options.id }, select: { publishedAt: true } });

  const publishedAt =
    input.status === 'published' ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null);

  if (options.id === undefined) {
    return db.post.create({
      data: { ...input, publishedAt, authorId: options.authorId },
      select: { id: true, slug: true },
    });
  }

  return db.post.update({
    where: { id: options.id },
    data: { ...input, publishedAt },
    select: { id: true, slug: true },
  });
}

export async function deletePost(db: PrismaClient, id: string): Promise<void> {
  await db.post.deleteMany({ where: { id } });
}
