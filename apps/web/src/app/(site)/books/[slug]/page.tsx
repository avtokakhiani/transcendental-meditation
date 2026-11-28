import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { BookDetail } from '@/components/books/book-detail';
import { prisma } from '@/server/db';
import { getPublishedBook } from '@/server/services/books';

export const dynamic = 'force-dynamic';

const loadBook = cache((slug: string) => getPublishedBook(prisma, slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const book = await loadBook((await params).slug);
  if (book === null) return {};
  return { title: book.title, ...(book.description ? { description: book.description } : {}) };
}

export default async function BookPage({ params }: { params: Promise<{ slug: string }> }) {
  const book = await loadBook((await params).slug);
  if (book === null) notFound();

  return <BookDetail book={book} />;
}
