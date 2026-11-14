import type { BookCard } from '@/server/services/books';

export function isPreviewBook(book: Pick<BookCard, 'id'>): boolean {
  return book.id.startsWith('preview-book-');
}

export function getBookHref(book: Pick<BookCard, 'id' | 'slug'>): string {
  // Preview samples have no detail pages; keep their existing catalog anchors.
  return isPreviewBook(book) ? `#${book.id}` : `/books/${book.slug}`;
}
