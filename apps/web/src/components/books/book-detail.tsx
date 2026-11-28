import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BookCover } from '@/components/book-cover';
import { ContinueReading } from '@/components/reader/continue-reading';
import type { BookDetail as BookDetailData } from '@/server/services/books';
import styles from './book-detail.module.css';

/** Shared presentation for every book; pagination stays owned by the book data and reader. */
export function BookDetail({ book }: { book: BookDetailData }) {
  return (
    <div className="mx-auto max-w-6xl px-4 pb-24 pt-10 sm:px-6 lg:px-10 lg:pt-16">
      <Link href="/books" className="inline-flex items-center gap-2 text-sm text-plum-500 hover:text-plum-800">
        <ArrowLeft aria-hidden="true" className="size-4" />
        ბიბლიოთეკა
      </Link>

      <div className="mt-10 grid items-start gap-10 md:grid-cols-[minmax(0,280px)_minmax(0,1fr)] md:gap-12 lg:gap-20">
        <div className={styles.coverFrame}>
          <BookCover title={book.title} author={book.author} coverImageUrl={book.coverImageUrl} className={styles.cover} />
        </div>

        <div className="min-w-0 [overflow-wrap:anywhere]">
          <h1 className="text-[2rem] leading-tight font-light text-plum-800 sm:text-[2.625rem]">{book.title}</h1>
          {book.author !== null ? <p className="mt-3 font-serif text-lg text-plum-500">{book.author}</p> : null}
          {book.description !== null ? (
            <p className="mt-5 max-w-2xl text-[15px] leading-8 whitespace-pre-line text-plum-500">{book.description}</p>
          ) : null}
          <p className="mt-4 text-sm text-plum-400">{book.pageCount} გვერდი</p>

          {book.pageCount > 0 ? <ContinueReading slug={book.slug} pageNumbers={book.pageNumbers} /> : null}
        </div>
      </div>

      {book.toc.length > 0 ? (
        <section aria-labelledby="book-contents-heading" className="mx-auto mt-16 max-w-4xl lg:mt-24">
          <h2 id="book-contents-heading" className="text-2xl leading-snug font-light text-plum-800 sm:text-3xl">სარჩევი</h2>
          <ol className="mt-6 border-t border-plum-300/40">
            {book.toc.map((entry) => (
              <li key={entry.number}>
                <Link
                  href={`/books/${book.slug}/${entry.number}`}
                  className="flex items-baseline justify-between gap-6 border-b border-plum-300/40 py-5 text-plum-800 transition hover:text-plum-500"
                >
                  <span className="min-w-0 text-base leading-7 [overflow-wrap:anywhere] sm:text-[17px]">{entry.title}</span>
                  <span className="shrink-0 font-serif text-sm text-saffron-600 italic tabular-nums">{entry.number}</span>
                </Link>
              </li>
            ))}
          </ol>
        </section>
      ) : null}
    </div>
  );
}
