import Link from 'next/link';
import type { ReactNode } from 'react';
import type { BookCard } from '@/server/services/books';
import { getBookHref } from './book-link';
import styles from './book-content-link.module.css';

/** Cover and title links share destinations and interaction styles in both book lists. */
export function BookContentLink({ book, kind, className = '', children }: {
  book: Pick<BookCard, 'id' | 'slug'>;
  kind: 'cover' | 'title';
  className?: string;
  children: ReactNode;
}) {
  return <Link href={getBookHref(book)} className={`${styles.link} ${styles[kind]} ${className}`}>{children}</Link>;
}
