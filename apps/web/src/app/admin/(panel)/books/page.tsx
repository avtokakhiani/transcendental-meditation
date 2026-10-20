import { formatDateKa } from '@tm/shared';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/admin/status-badge';
import { FeaturedBookForm } from '@/components/admin/featured-book-form';
import { primaryButton } from '@/components/admin/ui';
import { prisma } from '@/server/db';
import { listAllBooks } from '@/server/services/books';

export default async function AdminBooksPage({ searchParams }: { searchParams: Promise<{ featuredSaved?: string }> }) {
  const [books, settings, params] = await Promise.all([
    listAllBooks(prisma),
    prisma.homepageSettings.findUnique({ where: { id: 1 }, select: { featuredBookId: true } }),
    searchParams,
  ]);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-normal text-plum-900">წიგნები</h1>
        <Link href="/admin/books/new" className={primaryButton}>
          <Plus aria-hidden="true" className="size-4" />
          ახალი წიგნი
        </Link>
      </div>

      <FeaturedBookForm key={settings?.featuredBookId ?? 'none'} books={books} selectedId={settings?.featuredBookId ?? null} saved={params.featuredSaved === '1'} />

      <div className="mt-8 overflow-hidden rounded-3xl border border-cream-300 bg-cream-50">
        {books.length === 0 ? (
          <p className="p-10 text-center text-plum-500">წიგნები ჯერ არ არის.</p>
        ) : (
          <ul className="divide-y divide-cream-300">
            {books.map((book) => (
              <li key={book.id}>
                <Link href={`/admin/books/${book.id}`} className="flex flex-col gap-2 px-6 py-4 transition hover:bg-cream-100 sm:flex-row sm:items-center sm:gap-6">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] text-plum-900">{book.title}</p>
                    <p className="truncate text-xs text-plum-400">/books/{book.slug} · {book.pageCount} გვერდი</p>
                  </div>
                  <StatusBadge status={book.status} />
                  <span className="w-36 text-xs text-plum-400 sm:text-right">განახლდა {formatDateKa(book.updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
