'use client';

import { ChevronDown, ChevronUp } from 'lucide-react';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { BookCover } from '@/components/book-cover';
import type { BookCard } from '@/server/services/books';
import { BookContentLink } from './book-content-link';
import styles from './books.module.css';

const INITIAL_BOOK_COUNT = 4;

export function BookCatalog({ books }: { books: BookCard[] }) {
  const [expanded, setExpanded] = useState(false);
  const contentRef = useRef<HTMLDivElement>(null);
  const controlRef = useRef<HTMLButtonElement>(null);
  const previousHeight = useRef<number | null>(null);
  const animationRef = useRef<Animation | null>(null);

  useLayoutEffect(() => {
    const content = contentRef.current;
    if (content === null || previousHeight.current === null) return;
    const fromHeight = previousHeight.current;
    previousHeight.current = null;
    const finish = () => {
      if (!expanded) controlRef.current?.scrollIntoView({ block: 'nearest' });
    };
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      finish();
      return;
    }
    const animation = content.animate(
      [
        { height: `${fromHeight}px`, overflow: 'hidden' },
        { height: `${content.getBoundingClientRect().height}px`, overflow: 'hidden' },
      ],
      { duration: 240, easing: 'ease-in-out' },
    );
    animationRef.current = animation;
    animation.onfinish = finish;
    return () => animation.cancel();
  }, [expanded]);

  // Preview links in the unchanged carousel must also reach collapsed books.
  useEffect(() => {
    function revealBook(id: string) {
      if (!books.slice(INITIAL_BOOK_COUNT).some((book) => book.id === id)) return;
      setExpanded(true);
      requestAnimationFrame(() => document.getElementById(id)?.scrollIntoView({ block: 'start' }));
    }
    function revealLinkedBook() {
      revealBook(window.location.hash.slice(1));
    }
    function handleCatalogLink(event: MouseEvent) {
      if (event.button !== 0 || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      if (!(event.target instanceof Element)) return;
      const link = event.target.closest<HTMLAnchorElement>('a[href^="#"]');
      if (link !== null) revealBook(link.hash.slice(1));
    }
    revealLinkedBook();
    window.addEventListener('hashchange', revealLinkedBook);
    document.addEventListener('click', handleCatalogLink);
    return () => {
      window.removeEventListener('hashchange', revealLinkedBook);
      document.removeEventListener('click', handleCatalogLink);
    };
  }, [books]);

  function toggleCatalog() {
    if (contentRef.current !== null) {
      previousHeight.current = contentRef.current.getBoundingClientRect().height;
    }
    animationRef.current?.cancel();
    setExpanded((value) => !value);
  }

  return (
    <section aria-labelledby="catalog-heading" className="mt-4 bg-cream-100 pb-12 sm:mt-6 sm:pb-16 lg:mt-8 lg:pb-[5.5rem]">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <h2 id="catalog-heading" className="mb-10 text-center text-2xl font-normal leading-normal text-plum-800 sm:mb-12 sm:text-3xl">ყველა წიგნი</h2>
        <div ref={contentRef}>
          {books.length === 0 ? (
            <p className="rounded-3xl bg-cream-200 p-10 text-center text-plum-500">წიგნები მალე დაემატება.</p>
          ) : (
            <ul id="book-catalog-grid" className={`${styles.grid} mx-auto grid w-full max-w-[1200px] grid-cols-1 gap-x-5 gap-y-8 sm:grid-cols-2 sm:gap-y-10 lg:grid-cols-4`}>
              {books.map((book, index) => (
                <li key={book.id} id={book.id} className="min-w-0" hidden={!expanded && index >= INITIAL_BOOK_COUNT}>
                  <div className={`${styles.card} mx-auto block rounded-sm`}>
                    <div className={styles.coverFrame}>
                      <BookContentLink book={book} kind="cover" className={styles.catalogCover}>
                        <BookCover
                          title={book.title}
                          author={book.author}
                          coverImageUrl={book.coverImageUrl}
                          featured
                          className="block"
                        />
                      </BookContentLink>
                    </div>
                    <h3 className="mt-5 text-base leading-snug text-plum-800 sm:text-lg"><BookContentLink book={book} kind="title">{book.title}</BookContentLink></h3>
                    <p className="mt-1 text-sm text-plum-400">
                      {book.author !== null ? `${book.author} · ` : ''}
                      {book.pageCount} გვერდი
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        {books.length > INITIAL_BOOK_COUNT && (
          <div className="mt-10 text-center sm:mt-12">
            <button
              ref={controlRef}
              type="button"
              aria-expanded={expanded}
              aria-controls="book-catalog-grid"
              className="inline-flex min-h-11 cursor-pointer items-center gap-2 text-[15px] text-plum-700 underline decoration-plum-300 underline-offset-4 transition-colors hover:text-plum-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-700 motion-reduce:transition-none"
              onClick={toggleCatalog}
            >
              {expanded ? 'ნაკლების ჩვენება' : 'ყველა წიგნის ნახვა'}
              {expanded ? <ChevronUp aria-hidden="true" size={16} /> : <ChevronDown aria-hidden="true" size={16} />}
            </button>
          </div>
        )}
      </div>
    </section>
  );
}
