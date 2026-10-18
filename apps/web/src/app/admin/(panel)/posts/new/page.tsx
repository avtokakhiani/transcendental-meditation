import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { PostForm } from '@/components/admin/post-form';

export default function NewPostPage() {
  return (
    <div className="mx-auto max-w-6xl">
      <Link href="/admin/posts" className="inline-flex items-center gap-2 text-sm text-plum-500 hover:text-plum-900">
        <ArrowLeft aria-hidden="true" className="size-4" />
        პოსტები
      </Link>
      <h1 className="mb-8 mt-4 text-2xl font-normal text-plum-900">ახალი პოსტი</h1>
      <PostForm />
    </div>
  );
}
