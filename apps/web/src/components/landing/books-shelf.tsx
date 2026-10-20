import { ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { BookCover } from '@/components/book-cover';
import type { FeaturedBook } from '@/server/services/books';

export function BooksShelf({ featuredBook }: { featuredBook: FeaturedBook | null }) {
  return (
    <section aria-labelledby="books-heading" className="bg-cream-200 py-12 sm:py-14 lg:py-16">
      <div className={`mx-auto grid max-w-7xl items-center gap-10 px-4 sm:px-6 lg:gap-16 lg:px-10 ${featuredBook !== null ? 'md:grid-cols-2' : ''}`}>
        <div>
          <p className="text-[11px] uppercase tracking-[0.28em] text-plum-500">ქართული ბიბლიოთეკა</p>
          <h2 id="books-heading" className="mt-3 text-2xl leading-snug font-light text-plum-800 sm:text-3xl">
            წიგნები ცნობიერების შესახებ
          </h2>
          <p className="mt-5 max-w-lg text-[15px] leading-7 text-plum-500">
            გაეცანი წიგნებს ცნობიერების, მედიტაციისა და ადამიანის შინაგანი განვითარების შესახებ. წაიკითხე ქართულად, შენთვის სასურველ დროს.
          </p>
          <Link
            href="/books"
            className="mt-6 inline-flex items-center gap-2 rounded-full border border-plum-300 px-7 py-3.5 text-[15px] text-plum-800 transition-colors hover:border-plum-500 hover:bg-cream-50 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-700"
          >
            დაათვალიერე წიგნები
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
        </div>

        {featuredBook !== null ? (
          <div className="flex min-w-0 justify-center">
            <Link
              href={`/books/${featuredBook.slug}`}
              aria-labelledby={`featured-book-${featuredBook.id}`}
              className="group block w-44 max-w-full rounded-sm text-center focus-visible:outline-2 focus-visible:outline-offset-8 focus-visible:outline-plum-700 sm:w-56"
            >
              <BookCover title={featuredBook.title} author={featuredBook.author} coverImageUrl={featuredBook.coverImageUrl} featured />
              <h3 id={`featured-book-${featuredBook.id}`} className="mt-4 text-lg leading-snug font-normal text-plum-800 group-hover:text-plum-500">{featuredBook.title}</h3>
              {featuredBook.author !== null ? <p className="mt-1 text-sm text-plum-500">{featuredBook.author}</p> : null}
              <p className="mt-1 text-xs leading-relaxed text-plum-400">გამოქვეყნებული თავები: {featuredBook.chapterCount}</p>
            </Link>
          </div>
        ) : null}
      </div>
    </section>
  );
}
