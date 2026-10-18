'use client';

import { BookOpen, ExternalLink, Image as ImageIcon, Newspaper } from 'lucide-react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const ITEMS = [
  { label: 'პოსტები', href: '/admin/posts', Icon: Newspaper },
  { label: 'წიგნები', href: '/admin/books', Icon: BookOpen },
  { label: 'მედია', href: '/admin/media', Icon: ImageIcon },
] as const;

export function AdminNav() {
  const pathname = usePathname();

  return (
    <nav aria-label="მართვის მენიუ" className="flex gap-1 lg:flex-col">
      {ITEMS.map(({ label, href, Icon }) => {
        const active = pathname.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? 'page' : undefined}
            className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition ${
              active ? 'bg-plum-800 text-cream-100' : 'text-plum-600 hover:bg-cream-200 hover:text-plum-900'
            }`}
          >
            <Icon aria-hidden="true" className="size-4" strokeWidth={1.75} />
            <span className="hidden sm:inline">{label}</span>
          </Link>
        );
      })}
      <Link
        href="/"
        target="_blank"
        className="ml-auto flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-plum-500 transition hover:bg-cream-200 lg:ml-0 lg:mt-4"
      >
        <ExternalLink aria-hidden="true" className="size-4" strokeWidth={1.75} />
        <span className="hidden sm:inline">საიტის ნახვა</span>
      </Link>
    </nav>
  );
}
