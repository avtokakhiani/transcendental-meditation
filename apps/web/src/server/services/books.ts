import type { PrismaClient } from '@prisma/client';
import type { BookInput, BookPageInput, ContentFormat } from '@tm/shared';
import { sanitizeRichHtml } from '../sanitize';

export interface BookCard {
  id: string;
  slug: string;
  title: string;
  author: string | null;
  description: string | null;
  coverImageUrl: string | null;
  pageCount: number;
}

export interface TocEntry {
  number: number;
  title: string;
}

export interface BookDetail extends BookCard {
  toc: TocEntry[];
}

export interface ReaderBook {
  book: { slug: string; title: string; author: string | null };
  toc: TocEntry[];
  pages: Array<{ number: number; title: string | null; content: string; contentFormat: ContentFormat }>;
}

const PUBLISHED = { status: 'published' } as const;

export async function listPublishedBooks(db: PrismaClient, take?: number): Promise<BookCard[]> {
  const rows = await db.book.findMany({
    where: PUBLISHED,
    orderBy: { publishedAt: 'desc' },
    ...(take === undefined ? {} : { take }),
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      description: true,
      coverImageUrl: true,
      _count: { select: { pages: true } },
    },
  });

  return rows.map(({ _count, ...row }) => ({ ...row, pageCount: _count.pages }));
}

async function loadToc(db: PrismaClient, bookId: string): Promise<TocEntry[]> {
  const rows = await db.bookPage.findMany({
    where: { bookId, title: { not: null } },
    orderBy: { number: 'asc' },
    select: { number: true, title: true },
  });
  return rows.flatMap((row) => (row.title === null ? [] : [{ number: row.number, title: row.title }]));
}

export async function getPublishedBook(db: PrismaClient, slug: string): Promise<BookDetail | null> {
  const row = await db.book.findFirst({
    where: { ...PUBLISHED, slug },
    select: {
      id: true,
      slug: true,
      title: true,
      author: true,
      description: true,
      coverImageUrl: true,
      _count: { select: { pages: true } },
    },
  });
  if (row === null) return null;

  const { _count, ...book } = row;
  return { ...book, pageCount: _count.pages, toc: await loadToc(db, row.id) };
}

/** Whole book in one go: the reader renders every page as one continuous scroll. */
export async function getReaderBook(db: PrismaClient, slug: string): Promise<ReaderBook | null> {
  const book = await db.book.findFirst({
    where: { ...PUBLISHED, slug },
    select: {
      slug: true,
      title: true,
      author: true,
      pages: { orderBy: { number: 'asc' }, select: { number: true, title: true, content: true, contentFormat: true } },
    },
  });
  if (book === null) return null;

  const { pages: rows, ...meta } = book;
  const pages = rows.map((page) => ({ ...page, contentFormat: page.contentFormat as ContentFormat }));
  const toc = pages.flatMap((page) => (page.title === null ? [] : [{ number: page.number, title: page.title }]));
  return { book: meta, toc, pages };
}

// ---- Admin ----

export async function listAllBooks(db: PrismaClient) {
  const rows = await db.book.findMany({
    orderBy: { updatedAt: 'desc' },
    select: {
      id: true,
      slug: true,
      title: true,
      status: true,
      updatedAt: true,
      _count: { select: { pages: true } },
    },
  });
  return rows.map(({ _count, ...row }) => ({ ...row, pageCount: _count.pages }));
}

export async function getBookForEdit(db: PrismaClient, id: string) {
  return db.book.findUnique({
    where: { id },
    include: {
      pages: { orderBy: { number: 'asc' }, select: { id: true, number: true, title: true, content: true, contentFormat: true } },
    },
  });
}

export async function isBookSlugTaken(db: PrismaClient, slug: string, exceptId?: string) {
  const row = await db.book.findFirst({
    where: { slug, ...(exceptId === undefined ? {} : { id: { not: exceptId } }) },
    select: { id: true },
  });
  return row !== null;
}

export async function saveBook(
  db: PrismaClient,
  input: BookInput,
  id?: string,
): Promise<{ id: string }> {
  const existing =
    id === undefined ? null : await db.book.findUnique({ where: { id }, select: { publishedAt: true } });
  const publishedAt =
    input.status === 'published' ? (existing?.publishedAt ?? new Date()) : (existing?.publishedAt ?? null);

  if (id === undefined) {
    return db.book.create({ data: { ...input, publishedAt }, select: { id: true } });
  }
  return db.book.update({ where: { id }, data: { ...input, publishedAt }, select: { id: true } });
}

export async function deleteBook(db: PrismaClient, id: string): Promise<void> {
  await db.book.deleteMany({ where: { id } });
}

export async function getBookPageForEdit(db: PrismaClient, bookId: string, pageId: string) {
  return db.bookPage.findFirst({ where: { id: pageId, bookId } });
}

/** Appends at the end; inserting mid-book is done by adding then moving. */
function cleanPage(input: BookPageInput): BookPageInput {
  return { ...input, content: input.contentFormat === 'html' ? sanitizeRichHtml(input.content) : input.content };
}

export async function addBookPage(
  db: PrismaClient,
  bookId: string,
  input: BookPageInput,
): Promise<{ id: string; number: number }> {
  input = cleanPage(input);
  return db.$transaction(async (tx) => {
    const last = await tx.bookPage.aggregate({ where: { bookId }, _max: { number: true } });
    return tx.bookPage.create({
      data: { bookId, number: (last._max.number ?? 0) + 1, ...input },
      select: { id: true, number: true },
    });
  });
}

export async function updateBookPage(
  db: PrismaClient,
  bookId: string,
  pageId: string,
  input: BookPageInput,
): Promise<void> {
  await db.bookPage.updateMany({ where: { id: pageId, bookId }, data: cleanPage(input) });
}

/**
 * Renumbering is two-phase because the (bookId, number) unique index is checked per row in
 * SQL Server: shifting 3→2 while 2 still exists would fail mid-statement otherwise.
 */
async function renumber(
  tx: Parameters<Parameters<PrismaClient['$transaction']>[0]>[0],
  bookId: string,
  orderedIds: string[],
): Promise<void> {
  const OFFSET = 1_000_000;
  for (const [index, id] of orderedIds.entries()) {
    await tx.bookPage.update({ where: { id }, data: { number: OFFSET + index + 1 } });
  }
  await tx.bookPage.updateMany({ where: { bookId }, data: { number: { decrement: OFFSET } } });
}

export async function deleteBookPage(db: PrismaClient, bookId: string, pageId: string): Promise<void> {
  await db.$transaction(async (tx) => {
    await tx.bookPage.deleteMany({ where: { id: pageId, bookId } });
    const remaining = await tx.bookPage.findMany({
      where: { bookId },
      orderBy: { number: 'asc' },
      select: { id: true },
    });
    await renumber(tx, bookId, remaining.map((row) => row.id));
  });
}

export async function moveBookPage(
  db: PrismaClient,
  bookId: string,
  pageId: string,
  direction: 'up' | 'down',
): Promise<void> {
  await db.$transaction(async (tx) => {
    const ids = (
      await tx.bookPage.findMany({ where: { bookId }, orderBy: { number: 'asc' }, select: { id: true } })
    ).map((row) => row.id);

    const from = ids.indexOf(pageId);
    const to = direction === 'up' ? from - 1 : from + 1;
    if (from === -1 || to < 0 || to >= ids.length) return;

    [ids[from], ids[to]] = [ids[to]!, ids[from]!];
    await renumber(tx, bookId, ids);
  });
}
