'use client';

import { ChevronDown, Menu, Phone, X } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { SITE } from '@/lib/site';
import { Logo } from './logo';

interface NavLink {
  label: string;
  href: Route;
}

interface NavGroup {
  label: string;
  items: NavLink[];
}

const NAV: ReadonlyArray<NavLink | NavGroup> = [
  {
    label: 'TM-ის შესახებ',
    items: [
      { label: 'რა არის TM', href: '/blog/ra-aris-transtsendentuli-meditatsia' as Route },
      { label: 'როგორ ვსწავლობთ', href: '/#about' as Route },
      { label: 'სარგებელი', href: '/#benefits' as Route },
    ],
  },
  { label: 'ბლოგი', href: '/blog' },
  { label: 'წიგნები', href: '/books' },
  {
    label: 'რატომ TM?',
    items: [
      { label: 'სტრესისგან განთავისუფლება', href: '/#why' as Route },
      { label: 'ჯანსაღი გული', href: '/#why' as Route },
      { label: 'უკეთესი ძილი', href: '/#why' as Route },
    ],
  },
  { label: 'კონტაქტი', href: '/#contact' as Route },
];

function Dropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', close);
    document.addEventListener('keydown', close);
    return () => {
      document.removeEventListener('mousedown', close);
      document.removeEventListener('keydown', close);
    };
  }, [open]);

  return (
    <div
      ref={ref}
      className="relative"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-md px-1 py-2 text-[15px] text-plum-800 transition hover:text-plum-500"
      >
        {group.label}
        <ChevronDown aria-hidden="true" className={`size-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div className="absolute left-1/2 top-full z-40 w-64 -translate-x-1/2 pt-2">
          <ul className="rounded-2xl border border-cream-300 bg-cream-50 p-2 shadow-xl shadow-plum-900/5">
            {group.items.map((item) => (
              <li key={item.label}>
                <Link
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="block rounded-xl px-4 py-2.5 text-sm text-plum-700 transition hover:bg-cream-200 hover:text-plum-900"
                >
                  {item.label}
                </Link>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </div>
  );
}

export function SiteHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const pathname = usePathname();

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const close = (event: KeyboardEvent) => event.key === 'Escape' && setMenuOpen(false);
    document.addEventListener('keydown', close);
    return () => {
      document.body.style.overflow = previous;
      document.removeEventListener('keydown', close);
    };
  }, [menuOpen]);

  return (
    <header className="sticky top-0 z-30 border-b border-transparent bg-cream-100/90 backdrop-blur supports-[backdrop-filter]:bg-cream-100/75">
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <Logo />

        <nav aria-label="მთავარი ნავიგაცია" className="hidden items-center gap-7 lg:flex">
          {NAV.map((entry) =>
            'items' in entry ? (
              <Dropdown key={entry.label} group={entry} />
            ) : (
              <Link
                key={entry.label}
                href={entry.href}
                className={`px-1 py-2 text-[15px] transition hover:text-plum-500 ${
                  pathname.startsWith(entry.href) && entry.href !== '/' ? 'text-plum-500' : 'text-plum-800'
                }`}
              >
                {entry.label}
              </Link>
            ),
          )}
        </nav>

        <div className="flex items-center gap-3">
          <a
            href={SITE.phoneHref}
            aria-label={`დარეკვა: ${SITE.phone}`}
            title={SITE.phone}
            className="hidden size-10 place-items-center rounded-full text-plum-800 transition hover:bg-cream-200 sm:grid"
          >
            <Phone aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </a>
          <Link
            href={'/#contact' as Route}
            className="hidden rounded-full bg-mist-300 px-5 py-2.5 text-sm text-plum-800 transition hover:bg-mist-400 sm:inline-flex"
          >
            იპოვე მასწავლებელი
          </Link>
          <button
            type="button"
            aria-label="მენიუს გახსნა"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen(true)}
            className="grid size-10 place-items-center rounded-full text-plum-800 transition hover:bg-cream-200 lg:hidden"
          >
            <Menu aria-hidden="true" className="size-6" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div role="dialog" aria-modal="true" aria-label="მენიუ" className="fixed inset-0 z-50 flex flex-col bg-cream-100 lg:hidden">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6">
            <Logo />
            <button
              type="button"
              aria-label="მენიუს დახურვა"
              onClick={() => setMenuOpen(false)}
              className="grid size-10 place-items-center rounded-full text-plum-800 hover:bg-cream-200"
            >
              <X aria-hidden="true" className="size-6" strokeWidth={1.5} />
            </button>
          </div>
          <nav aria-label="მობილური ნავიგაცია" className="flex-1 overflow-y-auto px-6 pb-10 pt-4">
            {NAV.map((entry) =>
              'items' in entry ? (
                <div key={entry.label} className="border-b border-cream-300 py-4">
                  <p className="pb-2 text-xs uppercase tracking-[0.2em] text-plum-400">{entry.label}</p>
                  {entry.items.map((item) => (
                    <Link key={item.label} href={item.href} onClick={() => setMenuOpen(false)} className="block py-2 text-lg text-plum-800">
                      {item.label}
                    </Link>
                  ))}
                </div>
              ) : (
                <Link
                  key={entry.label}
                  href={entry.href}
                  onClick={() => setMenuOpen(false)}
                  className="block border-b border-cream-300 py-4 text-lg text-plum-800"
                >
                  {entry.label}
                </Link>
              ),
            )}
            <a href={SITE.phoneHref} className="mt-8 flex items-center gap-3 text-plum-700">
              <Phone aria-hidden="true" className="size-5" strokeWidth={1.5} />
              {SITE.phone}
            </a>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
