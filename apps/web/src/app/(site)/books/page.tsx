import type { Metadata } from 'next';
import Link from 'next/link';
import { BookCover } from '@/components/book-cover';
import benefitHero from '@/components/site/benefit-hero.module.css';
import { prisma } from '@/server/db';
import { listPublishedBooks } from '@/server/services/books';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './books.module.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'წიგნები',
  description: 'წიგნები მედიტაციისა და სიმშვიდის შესახებ, რომლებიც ონლაინ იკითხება.',
};

export default async function BooksPage() {
  const books = await listPublishedBooks(prisma);

  return (
    <div className="bg-cream-100">
      <section aria-labelledby="books-heading" className={`${hero.hero} ${styles.hero} ${benefitHero.hero} ${benefitHero.books}`}>
        <h1 id="books-heading" className={hero.heading}>აღმოაჩინე წიგნები ცნობიერების, მედიტაციისა და პიროვნული განვითარების შესახებ</h1>
      </section>

      <div className="mx-auto max-w-7xl px-4 pb-24 pt-12 sm:px-6 sm:pt-16 lg:px-10 lg:pt-20">
      {books.length === 0 ? (
        <p className="rounded-3xl bg-cream-200 p-10 text-center text-plum-500">წიგნები მალე დაემატება.</p>
      ) : (
        <ul className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 sm:gap-y-12 lg:grid-cols-4 lg:gap-x-10">
          {books.map((book) => (
            <li key={book.id} className="min-w-0">
              <Link href={`/books/${book.slug}`} className="group block rounded-sm focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-plum-700">
                <BookCover
                  title={book.title}
                  author={book.author}
                  coverImageUrl={book.coverImageUrl}
                  className="block w-full transition duration-500 group-hover:-translate-y-1.5"
                />
                <h2 className="mt-5 text-base leading-snug text-plum-800 group-hover:text-plum-500 sm:text-lg">{book.title}</h2>
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
    </div>
  );
}
