'use client';

import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import { useState, type KeyboardEvent } from 'react';
import { BookCover } from '@/components/book-cover';
import type { BookCard } from '@/server/services/books';
import { getBookHref, isPreviewBook } from './book-link';
import styles from './book-carousel.module.css';

export function BookCarousel({ books }: { books: BookCard[] }) {
  const [index, setIndex] = useState(0);
  if (books.length === 0) return null;

  const currentIndex = Math.min(index, books.length - 1);
  const book = books[currentIndex]!;
  const description = book.description?.trim()
    || 'დროებითი აღწერა — წიგნის მოკლე მიმოხილვა მალე დაემატება.';
  const shortDescription = description.length > 300
    ? `${description.slice(0, 300).replace(/\s+\S*$/, '')}…`
    : description;

  function move(direction: number) {
    setIndex(Math.max(0, Math.min(currentIndex + direction, books.length - 1)));
  }

  function handleKeyDown(event: KeyboardEvent<HTMLElement>) {
    if (event.altKey || event.ctrlKey || event.metaKey || event.shiftKey) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      move(event.key === 'ArrowLeft' ? -1 : 1);
    }
  }

  return (
    <section
      aria-label="წიგნების მიმოხილვა"
      aria-roledescription="კარუსელი"
      className={styles.carousel}
      tabIndex={0}
      onKeyDown={handleKeyDown}
    >
      <div className={styles.container}>
        <div
          key={book.id}
          id="book-carousel-slide"
          role="group"
          aria-roledescription="სლაიდი"
          aria-label={`${currentIndex + 1} / ${books.length}`}
          className={styles.slide}
        >
          <div className={styles.cover}>
            <BookCover
              title={book.title}
              author={book.author}
              coverImageUrl={book.coverImageUrl}
              className="block w-full"
            />
          </div>
          <div className={styles.copy}>
            <h2 className={styles.title}>{book.title}</h2>
            {book.author !== null && <p className={styles.author}>{book.author}</p>}
            <p className={styles.description}>{shortDescription}</p>
            <Link href={getBookHref(book)} className={styles.link}>
              {isPreviewBook(book) ? 'კატალოგში ნახვა' : 'წიგნის შესახებ'}
              <ArrowRight aria-hidden="true" size={16} />
            </Link>
          </div>
        </div>

        <div className={styles.navigation}>
          <button
            type="button"
            aria-label="წინა წიგნი"
            aria-controls="book-carousel-slide"
            disabled={currentIndex === 0}
            className={styles.arrow}
            onClick={() => move(-1)}
          >
            <ArrowLeft aria-hidden="true" size={20} />
          </button>
          <span role="status" aria-live="polite" aria-atomic="true" className={styles.position}>
            {currentIndex + 1} / {books.length}
            <span className="sr-only"> — {book.title}</span>
          </span>
          <button
            type="button"
            aria-label="შემდეგი წიგნი"
            aria-controls="book-carousel-slide"
            disabled={currentIndex === books.length - 1}
            className={styles.arrow}
            onClick={() => move(1)}
          >
            <ArrowRight aria-hidden="true" size={20} />
          </button>
        </div>
      </div>
    </section>
  );
}
