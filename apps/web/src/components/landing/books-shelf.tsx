import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BookCover } from '@/components/book-cover';
import type { BookCard } from '@/server/services/books';

export function BooksShelf({ books }: { books: BookCard[] }) {
  if (books.length === 0) return null;
  const [featured, ...rest] = books;

  return (
    <section className="bg-cream-200 py-20 lg:py-28">
      <div className="mx-auto grid max-w-7xl items-center gap-14 px-4 sm:px-6 lg:grid-cols-[1fr_1.1fr] lg:px-10">
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-plum-500">ონლაინ ბიბლიოთეკა</p>
          <h2 className="mt-4 text-3xl leading-tight font-light text-plum-800 sm:text-4xl">
            წიგნები, რომლებიც <em className="font-serif font-normal italic">პირდაპირ აქ</em> იკითხება
          </h2>
          <p className="mt-6 max-w-lg text-[15px] leading-7 text-plum-500">
            გადმოწერა არ არის საჭირო. გახსენით წიგნი, აირჩიეთ შრიფტის ზომა და ფონი — თქვენი
            ბოლო გვერდი დაიმახსოვრება.
          </p>
          <Link
            href="/books"
            className="mt-8 inline-flex items-center gap-2 rounded-full border border-plum-300 px-7 py-3.5 text-[15px] text-plum-800 transition hover:border-plum-500 hover:bg-cream-50"
          >
            ბიბლიოთეკის ნახვა
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        <div className="flex items-end justify-center gap-6 sm:gap-10">
          {[featured!, ...rest.slice(0, 2)].map((book, index) => (
            <Link
              key={book.id}
              href={`/books/${book.slug}`}
              className={`block transition duration-500 hover:-translate-y-2 ${index === 0 ? 'w-44 sm:w-56' : 'hidden w-36 sm:block sm:w-44'}`}
            >
              <BookCover title={book.title} author={book.author} coverImageUrl={book.coverImageUrl} />
              <p className="mt-4 text-sm text-plum-700">{book.title}</p>
              <p className="text-xs text-plum-400">{book.pageCount} გვერდი</p>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
