import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { BookPageForm } from '@/components/admin/book-page-form';
import { prisma } from '@/server/db';

export default async function NewBookPagePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const book = await prisma.book
    .findUnique({ where: { id }, select: { id: true, title: true, _count: { select: { pages: true } } } })
    .catch(() => null);
  if (book === null) notFound();

  return (
    <div className="mx-auto max-w-4xl">
      <Link href={`/admin/books/${book.id}`} className="inline-flex items-center gap-2 text-sm text-plum-500 hover:text-plum-900">
        <ArrowLeft aria-hidden="true" className="size-4" />
        {book.title}
      </Link>
      <h1 className="mb-8 mt-4 text-2xl font-normal text-plum-900">ახალი გვერდი <span className="text-plum-400">— №{book._count.pages + 1}</span></h1>
      <BookPageForm bookId={book.id} />
    </div>
  );
}
