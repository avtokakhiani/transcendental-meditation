import type { Metadata } from 'next';
import { AdminNav } from '@/components/admin/admin-nav';
import { LogoMark } from '@/components/site/logo';
import { requireUser } from '@/server/auth';
import { logoutAction } from '../login/actions';

export const metadata: Metadata = { title: 'მართვის პანელი', robots: { index: false } };

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const user = await requireUser();

  return (
    <div className="min-h-dvh bg-cream-100 lg:flex">
      <aside className="border-b border-cream-300 bg-cream-50 lg:sticky lg:top-0 lg:h-dvh lg:w-60 lg:shrink-0 lg:border-b-0 lg:border-r">
        <div className="flex items-center gap-3 px-4 py-4 lg:px-5 lg:py-6">
          <LogoMark className="size-8 text-plum-700" />
          <span className="text-sm text-plum-800">მართვის პანელი</span>
          <form action={logoutAction} className="ml-auto lg:hidden">
            <button type="submit" className="text-xs text-plum-500 hover:text-plum-900">გასვლა</button>
          </form>
        </div>
        <div className="px-3 pb-3 lg:px-3">
          <AdminNav />
        </div>
        <div className="absolute bottom-0 hidden w-60 border-t border-cream-300 p-4 lg:block">
          <p className="truncate text-sm text-plum-800">{user.firstName} {user.lastName}</p>
          <form action={logoutAction}>
            <button type="submit" className="mt-1 text-xs text-plum-500 hover:text-plum-900">გასვლა</button>
          </form>
        </div>
      </aside>
      <main className="min-w-0 flex-1 px-4 py-6 sm:px-8 lg:py-10">{children}</main>
    </div>
  );
}
