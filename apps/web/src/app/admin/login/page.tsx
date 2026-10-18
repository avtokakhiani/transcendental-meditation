import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { LoginFormFields } from '@/components/admin/login-form-fields';
import { LogoMark } from '@/components/site/logo';
import { getCurrentUser } from '@/server/auth';
import { loginAction } from './actions';

export const metadata: Metadata = { title: 'შესვლა', robots: { index: false } };

export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if ((await getCurrentUser()) !== null) redirect('/admin/posts');
  const { error } = await searchParams;

  return (
    <main className="grid min-h-dvh place-items-center bg-cream-100 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-10 text-center">
          <LogoMark className="mx-auto size-14 text-plum-700" />
          <h1 className="mt-5 text-xl font-normal text-plum-800">მართვის პანელი</h1>
          <p className="mt-1 text-sm text-plum-400">შედით ანგარიშში</p>
        </div>
        <form action={loginAction} className="rounded-3xl bg-cream-50 p-7 shadow-xl shadow-plum-900/5">
          <LoginFormFields hasError={error !== undefined} />
        </form>
      </div>
    </main>
  );
}
