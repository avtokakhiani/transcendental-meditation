import { ArrowLeft, ExternalLink, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookPageForm } from '@/components/admin/book-page-form';
import { ConfirmButton } from '@/components/admin/confirm-button';
import { prisma } from '@/server/db';
import { getBookPageForEdit } from '@/server/services/books';
import { deleteBookPageAction } from '../../../actions';

export default async function EditBookPagePage({
  params,
  searchParams,
}: {
  params: Promise<{ id: string; pageId: string }>;
  searchParams: Promise<{ saved?: string }>;
}) {
  const [{ id, pageId }, { saved }] = await Promise.all([params, searchParams]);
  const [book, page] = await Promise.all([
    prisma.book.findUnique({ where: { id }, select: { id: true, slug: true, title: true, status: true } }).catch(() => null),
    getBookPageForEdit(prisma, id, pageId).catch(() => null),
  ]);
  if (book === null || page === null) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/admin/books/${book.id}`} className="inline-flex items-center gap-2 text-sm text-plum-500 hover:text-plum-900">
        <ArrowLeft aria-hidden="true" className="size-4" />
        {book.title}
      </Link>
      <div className="mb-8 mt-4 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-2xl font-normal text-plum-900">გვერდი №{page.number}</h1>
        <div className="flex items-center gap-2">
          {book.status === 'published' ? (
            <Link href={`/books/${book.slug}/${page.number}`} target="_blank" className="inline-flex items-center gap-2 px-3 py-2 text-sm text-plum-600 hover:text-plum-900">
              <ExternalLink aria-hidden="true" className="size-4" />
              ნახვა
            </Link>
          ) : null}
          <form action={deleteBookPageAction}>
            <input type="hidden" name="bookId" value={book.id} />
            <input type="hidden" name="pageId" value={page.id} />
            <ConfirmButton message="წავშალოთ გვერდი? შემდეგი გვერდები გადაინომრება.">
              <Trash2 aria-hidden="true" className="size-4" />
              წაშლა
            </ConfirmButton>
          </form>
        </div>
      </div>
      <BookPageForm key={page.updatedAt.toISOString()} bookId={book.id} page={page} saved={saved === '1'} />
    </div>
  );
}
