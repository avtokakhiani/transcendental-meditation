import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { BookForm } from '@/components/admin/book-form';

export default function NewBookPage() {
  return (
    <div className="mx-auto max-w-5xl">
      <Link href="/admin/books" className="inline-flex items-center gap-2 text-sm text-plum-500 hover:text-plum-900">
        <ArrowLeft aria-hidden="true" className="size-4" />
        წიგნები
      </Link>
      <h1 className="mb-8 mt-4 text-2xl font-normal text-plum-900">ახალი წიგნი</h1>
      <BookForm />
      <p className="mt-6 text-sm text-plum-400">გვერდების დამატება შესაძლებელია წიგნის შენახვის შემდეგ.</p>
    </div>
  );
}
