import { excerpt } from '@tm/shared';
import { ArrowDown, ArrowLeft, ArrowUp, ExternalLink, Plus, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookForm } from '@/components/admin/book-form';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { primaryButton } from '@/components/admin/ui';
import { prisma } from '@/server/db';
import { getBookForEdit } from '@/server/services/books';
import { deleteBookAction, moveBookPageAction } from '../actions';

export default async function EditBookPage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id }, { saved }] = await Promise.all([params, searchParams]);
  const book = await getBookForEdit(prisma, id).catch(() => null);
  if (book === null) notFound();

  const moveButton = 'grid size-8 place-items-center rounded-lg text-plum-500 transition hover:bg-cream-200 hover:text-plum-900 disabled:opacity-30';

  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/books" className="inline-flex items-center gap-2 text-sm text-plum-500 hover:text-plum-900">
        <ArrowLeft aria-hidden="true" className="size-4" />
        წიგნები
      </Link>
      <div className="mb-8 mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-normal text-plum-900">{book.title}</h1>
        <div className="flex items-center gap-2">
          {book.status === 'published' ? (
            <Link href={`/books/${book.slug}`} target="_blank" className="inline-flex items-center gap-2 px-3 py-2 text-sm text-plum-600 hover:text-plum-900">
              <ExternalLink aria-hidden="true" className="size-4" />
              ნახვა
            </Link>
          ) : null}
          <form action={deleteBookAction}>
            <input type="hidden" name="id" value={book.id} />
            <ConfirmButton message="წავშალოთ წიგნი ყველა გვერდთან ერთად? ამ მოქმედების დაბრუნება შეუძლებელია.">
              <Trash2 aria-hidden="true" className="size-4" />
              წაშლა
            </ConfirmButton>
          </form>
        </div>
      </div>

      <BookForm key={book.updatedAt.toISOString()} book={book} saved={saved === '1'} />

      <section className="mt-12">
        <div className="flex items-center justify-between gap-4">
          <h2 className="text-xl font-normal text-plum-900">გვერდები <span className="text-plum-400">({book.pages.length})</span></h2>
          <Link href={`/admin/books/${book.id}/pages/new`} className={primaryButton}>
            <Plus aria-hidden="true" className="size-4" />
            გვერდის დამატება
          </Link>
        </div>

        <ol className="mt-6 overflow-hidden rounded-3xl border border-cream-300 bg-cream-50">
          {book.pages.length === 0 ? (
            <li className="p-10 text-center text-plum-500">გვერდები ჯერ არ არის.</li>
          ) : (
            book.pages.map((page, index) => (
              <li key={page.id} className="flex items-center gap-3 border-b border-cream-300 px-4 py-3 last:border-b-0 sm:px-6">
                <span className="w-8 shrink-0 font-serif text-lg text-saffron-600 italic tabular-nums">{page.number}</span>
                <Link href={`/admin/books/${book.id}/pages/${page.id}`} className="min-w-0 flex-1 rounded-lg py-1 hover:text-plum-500">
                  {page.title !== null ? <p className="truncate text-[15px] text-plum-900">{page.title}</p> : null}
                  <p className="truncate text-sm text-plum-400">{excerpt(page.content, 110, page.contentFormat === 'html' ? 'html' : 'markdown') || 'ცარიელი გვერდი'}</p>
                </Link>
                <form action={moveBookPageAction} className="flex shrink-0">
                  <input type="hidden" name="bookId" value={book.id} />
                  <input type="hidden" name="pageId" value={page.id} />
                  <button type="submit" name="direction" value="up" disabled={index === 0} aria-label="ზემოთ" className={moveButton}>
                    <ArrowUp aria-hidden="true" className="size-4" />
                  </button>
                  <button type="submit" name="direction" value="down" disabled={index === book.pages.length - 1} aria-label="ქვემოთ" className={moveButton}>
                    <ArrowDown aria-hidden="true" className="size-4" />
                  </button>
                </form>
              </li>
            ))
          )}
        </ol>
      </section>
    </div>
  );
}
