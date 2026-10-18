import type { Metadata } from 'next';
import Link from 'next/link';
import { BookCover } from '@/components/book-cover';
import { prisma } from '@/server/db';
import { listPublishedBooks } from '@/server/services/books';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'წიგნები',
  description: 'წიგნები მედიტაციისა და სიმშვიდის შესახებ, რომლებიც ონლაინ იკითხება.',
};

export default async function BooksPage() {
  const books = await listPublishedBooks(prisma);

  return (
    <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 lg:px-10 lg:pt-20">
      <header className="max-w-2xl">
        <p className="text-[11px] uppercase tracking-[0.28em] text-plum-500">ბიბლიოთეკა</p>
        <h1 className="mt-5 text-4xl leading-tight font-light text-plum-800 sm:text-5xl">
          წიგნები <em className="font-serif font-normal italic">ონლაინ</em>
        </h1>
        <p className="mt-5 text-[15px] leading-7 text-plum-500">აირჩიეთ წიგნი და დაიწყეთ კითხვა პირდაპირ ბრაუზერში.</p>
      </header>

      {books.length === 0 ? (
        <p className="mt-16 rounded-3xl bg-cream-200 p-10 text-center text-plum-500">წიგნები მალე დაემატება.</p>
      ) : (
        <ul className="mt-14 grid grid-cols-2 gap-x-6 gap-y-14 sm:grid-cols-3 lg:grid-cols-4 lg:gap-x-10">
          {books.map((book) => (
            <li key={book.id}>
              <Link href={`/books/${book.slug}`} className="group block">
                <BookCover
                  title={book.title}
                  author={book.author}
                  coverImageUrl={book.coverImageUrl}
                  className="transition duration-500 group-hover:-translate-y-1.5"
                />
                <h2 className="mt-5 text-lg leading-snug text-plum-800 group-hover:text-plum-500">{book.title}</h2>
                <p className="mt-1 text-sm text-plum-400">
                  {book.author !== null ? `${book.author} · ` : ''}
                  {book.pageCount} გვერდი
                </p>
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
