import type {PrismaClient} from '@prisma/client';
import type {ContentFormat} from '@tm/shared';

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

/** Admin list: every status, newest edits first. */
export async function listAllPosts(db: PrismaClient) {
  const rows = await db.post.findMany({
    orderBy: { updatedAt: 'desc' },
    select: { id: true, slug: true, title: true, status: true, publishedAt: true, updatedAt: true,
      draftRevisionId: true, publishedRevisionId: true, draftRevision: { select: { title: true } } },
  });
  return rows.map(row => ({ ...row, title: row.draftRevision?.title ?? row.title,
    hasDraftChanges: Boolean(row.publishedRevisionId && row.draftRevisionId !== row.publishedRevisionId) }));
}
