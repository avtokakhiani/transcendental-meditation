'use client';

import {
  Children,
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from 'react';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import Link from 'next/link';
import styles from './related-articles-carousel.module.css';

export function RelatedArticlesCarousel({ children }: { children: ReactNode }) {
  const cards = Children.toArray(children);
  const viewport = useRef<HTMLDivElement>(null);
  const requestedIndex = useRef<number | null>(null);
  const viewportId = useId();
  const [navigation, setNavigation] = useState({
    first: 0,
    visible: 1,
    overflow: false,
    previous: false,
    next: false,
  });

  const measure = useCallback(() => {
    const element = viewport.current;
    if (!element) return;
    const visible = Number(getComputedStyle(element).getPropertyValue('--visible-cards')) || 1;
    const step =
      (element.firstElementChild?.getBoundingClientRect().width ?? 0) +
      parseFloat(getComputedStyle(element).columnGap);
    const maximum = Math.max(0, cards.length - visible);
    const first = step ? Math.min(maximum, Math.max(0, Math.round(element.scrollLeft / step))) : 0;
    const value = {
      first,
      visible,
      overflow: cards.length > visible,
      previous: element.scrollLeft > 1,
      next: element.scrollLeft < element.scrollWidth - element.clientWidth - 1,
    };
    setNavigation((current) =>
      Object.keys(value).every(
        (key) => current[key as keyof typeof current] === value[key as keyof typeof value],
      )
        ? current
        : value,
    );
  }, [cards.length]);

  useEffect(() => {
    const element = viewport.current;
    if (!element) return;
    const observer = new ResizeObserver(() => {
      requestedIndex.current = null;
      measure();
    });
    observer.observe(element);
    const reset = () => {
      requestedIndex.current = null;
    };
    element.addEventListener('scrollend', reset);
    return () => {
      observer.disconnect();
      element.removeEventListener('scrollend', reset);
    };
  }, [measure]);

  function move(direction: number, edge?: 'first' | 'last') {
    const element = viewport.current;
    if (!element) return;
    const step =
      (element.firstElementChild?.getBoundingClientRect().width ?? 0) +
      parseFloat(getComputedStyle(element).columnGap);
    const maximum = Math.max(0, cards.length - navigation.visible);
    const index =
      edge === 'first'
        ? 0
        : edge === 'last'
          ? maximum
          : Math.min(
              maximum,
              Math.max(
                0,
                (requestedIndex.current ?? Math.round(element.scrollLeft / step)) + direction,
              ),
            );
    requestedIndex.current = index;
    element.scrollTo({
      left: index * step,
      behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth',
    });
  }

  function onKeyDown(event: KeyboardEvent<HTMLDivElement>) {
    if (event.target !== event.currentTarget) return;
    if (
      event.key === 'ArrowLeft' ||
      event.key === 'ArrowRight' ||
      event.key === 'Home' ||
      event.key === 'End'
    ) {
      event.preventDefault();
      move(
        event.key === 'ArrowLeft' ? -1 : 1,
        event.key === 'Home' ? 'first' : event.key === 'End' ? 'last' : undefined,
      );
    }
  }

  if (cards.length === 0) return null;
  return (
    <section
      aria-labelledby="related-articles-heading"
      aria-roledescription="კარუსელი"
      className="bg-cream-100 py-12 sm:py-14 lg:py-16"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
          <h2
            id="related-articles-heading"
            className="min-w-0 text-2xl leading-relaxed font-light text-plum-800 sm:text-3xl"
          >
            სხვა საინტერესო სტატიები
          </h2>
          <div className="ml-auto flex shrink-0 items-center gap-4">
            {navigation.overflow ? (
              <div className="flex shrink-0 gap-2">
                <button
                  type="button"
                  className={styles.arrow}
                  aria-label="წინა სტატია"
                  aria-controls={viewportId}
                  disabled={!navigation.previous}
                  onClick={() => move(-1)}
                >
                  <ArrowLeft aria-hidden="true" size={18} strokeWidth={1.5} />
                </button>
                <button
                  type="button"
                  className={styles.arrow}
                  aria-label="შემდეგი სტატია"
                  aria-controls={viewportId}
                  disabled={!navigation.next}
                  onClick={() => move(1)}
                >
                  <ArrowRight aria-hidden="true" size={18} strokeWidth={1.5} />
                </button>
              </div>
            ) : null}
            <Link
              href="/blog"
              className="inline-flex min-h-11 items-center gap-2 rounded-sm text-[15px] text-plum-700 hover:text-plum-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-700"
            >
              ყველა სტატია
              <ArrowRight aria-hidden="true" className="size-4" />
            </Link>
          </div>
        </div>
        <div
          ref={viewport}
          id={viewportId}
          className={styles.viewport}
          tabIndex={navigation.overflow ? 0 : -1}
          role="group"
          aria-label="სტატიები — გამოიყენე ისრიანი ღილაკები გადასაადგილებლად"
          onScroll={measure}
          onPointerDown={() => {
            requestedIndex.current = null;
          }}
          onWheel={() => {
            requestedIndex.current = null;
          }}
          onKeyDown={onKeyDown}
        >
          {cards}
        </div>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          სტატიები {navigation.first + 1}–
          {Math.min(cards.length, navigation.first + navigation.visible)} / {cards.length}
        </p>
      </div>
    </section>
  );
}
