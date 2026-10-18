import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { BookCover } from '@/components/book-cover';
import { ContinueReading } from '@/components/reader/continue-reading';
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

  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-10 lg:pt-16">
      <Link href="/books" className="inline-flex items-center gap-2 text-sm text-plum-500 hover:text-plum-800">
        <ArrowLeft aria-hidden="true" className="size-4" />
        ბიბლიოთეკა
      </Link>

      <div className="mt-10 grid gap-12 md:grid-cols-[280px_1fr] lg:gap-20">
        <BookCover title={book.title} author={book.author} coverImageUrl={book.coverImageUrl} className="mx-auto w-56 md:w-full" />

        <div>
          <h1 className="text-4xl leading-tight font-light text-plum-800 sm:text-5xl">{book.title}</h1>
          {book.author !== null ? <p className="mt-4 font-serif text-lg text-plum-500">{book.author}</p> : null}
          {book.description !== null ? (
            <p className="mt-6 max-w-2xl text-[15px] leading-8 whitespace-pre-line text-plum-500">{book.description}</p>
          ) : null}
          <p className="mt-4 text-sm text-plum-400">{book.pageCount} გვერდი</p>

          {book.pageCount > 0 ? <ContinueReading slug={book.slug} pageCount={book.pageCount} /> : null}

          {book.toc.length > 0 ? (
            <section className="mt-14">
              <h2 className="text-[11px] uppercase tracking-[0.28em] text-plum-500">სარჩევი</h2>
              <ol className="mt-5 border-t border-dotted border-plum-300">
                {book.toc.map((entry) => (
                  <li key={entry.number}>
                    <Link
                      href={`/books/${book.slug}/${entry.number}`}
                      className="flex items-baseline justify-between gap-6 border-b border-dotted border-plum-300 py-4 text-plum-800 transition hover:text-plum-500"
                    >
                      <span className="text-[17px]">{entry.title}</span>
                      <span className="font-serif text-sm text-saffron-600 italic">{entry.number}</span>
                    </Link>
                  </li>
                ))}
              </ol>
            </section>
          ) : null}
        </div>
      </div>
    </div>
  );
}
