import Link from 'next/link';
import { LogoMark } from '@/components/site/logo';

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center bg-cream-100 px-4 text-center">
      <div>
        <LogoMark className="mx-auto size-16 text-plum-400" />
        <h1 className="mt-8 text-3xl font-light text-plum-800">გვერდი ვერ მოიძებნა</h1>
        <p className="mt-3 text-plum-500">შესაძლოა ბმული შეიცვალა ან წაიშალა.</p>
        <Link href="/" className="mt-8 inline-flex rounded-full bg-saffron-400 px-7 py-3.5 text-[15px] font-medium text-plum-900 hover:bg-saffron-500">
          მთავარ გვერდზე
        </Link>
      </div>
    </main>
  );
}
