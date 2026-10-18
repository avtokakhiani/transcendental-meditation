import { ChevronLeft, ChevronRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';

export function Pagination({
  page,
  pageSize,
  total,
  basePath,
}: {
  page: number;
  pageSize: number;
  total: number;
  basePath: string;
}) {
  const pages = Math.ceil(total / pageSize);
  if (pages <= 1) return null;

  const href = (target: number) => (target === 1 ? basePath : `${basePath}?page=${target}`) as Route;
  const linkClass =
    'grid size-11 place-items-center rounded-full border border-cream-300 text-plum-700 transition hover:border-plum-400';

  return (
    <nav aria-label="გვერდები" className="flex items-center justify-center gap-2">
      {page > 1 ? (
        <Link href={href(page - 1)} aria-label="წინა გვერდი" className={linkClass}>
          <ChevronLeft aria-hidden="true" className="size-4" />
        </Link>
      ) : null}
      {Array.from({ length: pages }, (_, index) => index + 1).map((target) => (
        <Link
          key={target}
          href={href(target)}
          aria-current={target === page ? 'page' : undefined}
          className={`grid size-11 place-items-center rounded-full text-sm transition ${
            target === page ? 'bg-plum-800 text-cream-100' : 'text-plum-700 hover:bg-cream-200'
          }`}
        >
          {target}
        </Link>
      ))}
      {page < pages ? (
        <Link href={href(page + 1)} aria-label="შემდეგი გვერდი" className={linkClass}>
          <ChevronRight aria-hidden="true" className="size-4" />
        </Link>
      ) : null}
    </nav>
  );
}
