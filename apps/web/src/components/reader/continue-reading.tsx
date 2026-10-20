'use client';

import { BookOpen } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useState } from 'react';
import { loadLastPage } from './reading-progress';

export function ContinueReading({ slug, pageNumbers }: { slug: string; pageNumbers: number[] }) {
  const [lastPage, setLastPage] = useState<number | null>(null);

  useEffect(() => {
    const saved = loadLastPage(slug);
    setLastPage(saved !== null && saved !== pageNumbers[0] && pageNumbers.includes(saved) ? saved : null);
  }, [slug, pageNumbers]);

  return (
    <div className="mt-10 flex flex-col gap-3 sm:flex-row">
      {lastPage !== null ? (
        <Link
          href={`/books/${slug}/${lastPage}`}
          className="inline-flex items-center justify-center gap-2 rounded-full bg-saffron-400 px-8 py-4 text-[15px] font-medium text-plum-900 transition hover:bg-saffron-500"
        >
          <BookOpen aria-hidden="true" className="size-4" />
          გაგრძელება — გვერდი {lastPage}
        </Link>
      ) : null}
      <Link
        href={`/books/${slug}/${pageNumbers[0]}`}
        className={
          lastPage === null
            ? 'inline-flex items-center justify-center gap-2 rounded-full bg-saffron-400 px-8 py-4 text-[15px] font-medium text-plum-900 transition hover:bg-saffron-500'
            : 'inline-flex items-center justify-center rounded-full border border-plum-300 px-8 py-4 text-[15px] text-plum-800 transition hover:border-plum-500'
        }
      >
        {lastPage === null ? <BookOpen aria-hidden="true" className="size-4" /> : null}
        {lastPage === null ? 'კითხვის დაწყება' : 'თავიდან დაწყება'}
      </Link>
    </div>
  );
}
