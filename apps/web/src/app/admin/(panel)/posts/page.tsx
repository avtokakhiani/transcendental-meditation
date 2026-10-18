import { formatDateKa } from '@tm/shared';
import { Plus } from 'lucide-react';
import Link from 'next/link';
import { StatusBadge } from '@/components/admin/status-badge';
import { primaryButton } from '@/components/admin/ui';
import { prisma } from '@/server/db';
import { listAllPosts } from '@/server/services/posts';

export default async function AdminPostsPage() {
  const posts = await listAllPosts(prisma);

  return (
    <div className="mx-auto max-w-5xl">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-normal text-plum-900">პოსტები</h1>
        <Link href="/admin/posts/new" className={primaryButton}>
          <Plus aria-hidden="true" className="size-4" />
          ახალი პოსტი
        </Link>
      </div>

      <div className="mt-8 overflow-hidden rounded-3xl border border-cream-300 bg-cream-50">
        {posts.length === 0 ? (
          <p className="p-10 text-center text-plum-500">პოსტები ჯერ არ არის.</p>
        ) : (
          <ul className="divide-y divide-cream-300">
            {posts.map((post) => (
              <li key={post.id}>
                <Link href={`/admin/posts/${post.id}`} className="flex flex-col gap-2 px-6 py-4 transition hover:bg-cream-100 sm:flex-row sm:items-center sm:gap-6">
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-[15px] text-plum-900">{post.title}</p>
                    <p className="truncate text-xs text-plum-400">/blog/{post.slug}</p>
                  </div>
                  <StatusBadge status={post.status} />
                  <span className="w-36 text-xs text-plum-400 sm:text-right">განახლდა {formatDateKa(post.updatedAt)}</span>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
