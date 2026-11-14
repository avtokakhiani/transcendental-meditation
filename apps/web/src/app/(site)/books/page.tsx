import type { Metadata } from 'next';
import benefitHero from '@/components/site/benefit-hero.module.css';
import { prisma } from '@/server/db';
import { listPublishedBooks } from '@/server/services/books';
import hero from '../stress-and-anxiety/stress-and-anxiety.module.css';
import styles from './books.module.css';
import { PREVIEW_BOOKS } from './preview-books';
import { BookCarousel } from './book-carousel';
import { BookCatalog } from './book-catalog';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'წიგნები',
  description: 'წიგნები მედიტაციისა და სიმშვიდის შესახებ, რომლებიც ონლაინ იკითხება.',
};

export default async function BooksPage() {
  const books = [...(await listPublishedBooks(prisma)), ...PREVIEW_BOOKS];

  return (
    <div className="bg-cream-100">
      <section aria-labelledby="books-heading" className={`${hero.hero} ${styles.hero} ${benefitHero.hero} ${benefitHero.books}`}>
        <h1 id="books-heading" className={hero.heading}>წიგნები</h1>
      </section>

      <BookCarousel books={books} />

      <BookCatalog books={books} />
    </div>
  );
}
