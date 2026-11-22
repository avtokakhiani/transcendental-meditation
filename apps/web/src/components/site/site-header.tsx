'use client';

import { ChevronDown, Menu, Phone, X } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { INTRODUCTORY_MEETING_ROUTE } from '@/lib/routes';
import { lockBodyScroll } from '@/lib/body-scroll-lock';
import { Logo } from './logo';
import styles from './site-header.module.css';

const HEADER_CONTACT = {
  phone: '+995 511 30 89 39',
  phoneHref: 'tel:+995511308939',
} as const;

interface NavLink {
  label: string;
  href: Route;
}

interface NavGroup {
  label: string;
  items: NavLink[];
}

const NAV: ReadonlyArray<NavLink | NavGroup> = [
  { label: 'რა არის TM?', href: '/blog/ra-aris-transtsendentuli-meditatsia' as Route },
  {
    label: 'რატომ TM?',
    items: [
      { label: 'შფოთვის შემცირება', href: '/stress-and-anxiety' as Route },
      { label: 'ჯანმრთელობის გაუმჯობესება', href: '/health' as Route },
      { label: 'ტვინის ფუნქციონირების გაუმჯობესება', href: '/brain-function' as Route },
      { label: 'ურთიერთობების გაუმჯობესება', href: '/relationships' as Route },
      { label: 'მშვიდობის ხელშეწყობა', href: '/peace' as Route },
      { label: 'ყველა სარგებელი', href: '/benefits' as Route },
    ],
  },
  { label: 'როგორ ვისწავლო?', href: '/how-to-learn' as Route },
  { label: 'ორგანიზაციებისთვის', href: '/organizaciebitvis' as Route },
  {
    label: 'მეტი',
    items: [
      { label: 'სტატიები', href: '/blog' },
      { label: 'წიგნები', href: '/books' },
      { label: 'ჩვენ შესახებ', href: '/about' as Route },
      { label: 'ხშირად დასმული კითხვები', href: '/faq' as Route },
    ],
  },
];

function Dropdown({ group }: { group: NavGroup }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const panelId = useId();

  useEffect(() => {
    if (!open) return;
    const close = (event: MouseEvent | KeyboardEvent) => {
      if (event instanceof KeyboardEvent ? event.key === 'Escape' : !ref.current?.contains(event.target as Node)) {
        setOpen(false);
        if (event instanceof KeyboardEvent && ref.current?.contains(document.activeElement)) {
          triggerRef.current?.focus();
        }
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
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setOpen(false);
      }}
    >
      <button
        ref={triggerRef}
        type="button"
        aria-expanded={open}
        aria-controls={open ? panelId : undefined}
        onClick={() => setOpen((value) => !value)}
        className="flex items-center gap-1.5 rounded-md px-1 py-2 text-[15px] text-plum-800 transition hover:text-plum-500"
      >
        {group.label}
        <ChevronDown aria-hidden="true" className={`size-4 transition ${open ? 'rotate-180' : ''}`} />
      </button>
      {open ? (
        <div id={panelId} className="absolute left-1/2 top-full z-40 w-80 -translate-x-1/2 pt-2">
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
  const [phoneTooltipDismissed, setPhoneTooltipDismissed] = useState(false);
  const phoneTooltipId = useId();
  const pathname = usePathname();
  const transparentOnTop = pathname === '/stress-and-anxiety'
    || pathname === '/about'
    || pathname === '/faq'
    || pathname === '/books'
    || pathname === '/how-to-learn'
    || pathname === '/benefits'
    || pathname === '/organizaciebitvis'
    || pathname === '/health'
    || pathname === '/brain-function'
    || pathname === '/relationships'
    || pathname === '/peace'
    || pathname === '/blog/ra-aris-transtsendentuli-meditatsia';
  const isHomepage = pathname === '/';
  const headerRef = useRef<HTMLElement>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const [pastHeader, setPastHeader] = useState(false);

  useEffect(() => {
    if (!transparentOnTop && !isHomepage) return;
    const updateBackground = () => {
      const headerHeight = headerRef.current?.getBoundingClientRect().height;
      if (headerHeight !== undefined) {
        setPastHeader(transparentOnTop ? window.scrollY >= headerHeight : window.scrollY > 0);
      }
    };
    updateBackground();
    window.addEventListener('scroll', updateBackground, { passive: true });
    window.addEventListener('resize', updateBackground);
    return () => {
      window.removeEventListener('scroll', updateBackground);
      window.removeEventListener('resize', updateBackground);
    };
  }, [transparentOnTop, isHomepage]);

  useEffect(() => setMenuOpen(false), [pathname]);

  useEffect(() => {
    if (!menuOpen) return;
    const unlockScroll = lockBodyScroll();
    const previousFocus = document.activeElement as HTMLElement | null;
    const focusable = () => Array.from(menuRef.current?.querySelectorAll<HTMLElement>('a[href], button') ?? []);
    focusable()[0]?.focus();
    const close = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setMenuOpen(false);
      if (event.key !== 'Tab') return;
      const items = focusable();
      const first = items[0];
      const last = items[items.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    const desktop = window.matchMedia('(min-width: 1280px)');
    const closeOnDesktop = () => { if (desktop.matches) setMenuOpen(false); };
    desktop.addEventListener('change', closeOnDesktop);
    document.addEventListener('keydown', close);
    return () => {
      unlockScroll();
      document.removeEventListener('keydown', close);
      desktop.removeEventListener('change', closeOnDesktop);
      previousFocus?.focus();
    };
  }, [menuOpen]);

  return (
    <header
      ref={headerRef}
      style={menuOpen ? { backdropFilter: 'none' } : undefined}
      data-transparent={transparentOnTop ? !pastHeader : undefined}
      data-menu-open={transparentOnTop && menuOpen ? true : undefined}
      className={`sticky top-0 z-30 border-b border-transparent bg-cream-100/90 backdrop-blur supports-[backdrop-filter]:bg-cream-100/75${transparentOnTop ? ` ${styles.overlay}` : ''}${isHomepage && pastHeader ? ` ${styles.opaque}` : ''}`}
    >
      <div className="mx-auto flex h-20 max-w-7xl items-center justify-between gap-6 px-4 sm:px-6 lg:px-10">
        <Logo variant="header" />

        <nav aria-label="მთავარი ნავიგაცია" className="hidden items-center gap-7 whitespace-nowrap xl:flex">
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

        <div className="flex shrink-0 items-center gap-3">
          <a
            href={HEADER_CONTACT.phoneHref}
            aria-label={`დარეკვა: ${HEADER_CONTACT.phone}`}
            aria-describedby={phoneTooltipId}
            onFocus={() => setPhoneTooltipDismissed(false)}
            onPointerEnter={() => setPhoneTooltipDismissed(false)}
            onKeyDown={event => { if (event.key === 'Escape') setPhoneTooltipDismissed(true); }}
            className={`relative hidden size-10 shrink-0 place-items-center rounded-full text-plum-800 transition hover:bg-cream-200 sm:grid ${styles.phoneLink}`}
          >
            <Phone aria-hidden="true" className="size-5" strokeWidth={1.5} />
            <span id={phoneTooltipId} role="tooltip" className={`${styles.phoneTooltip}${phoneTooltipDismissed ? ` ${styles.tooltipDismissed}` : ''}`}>{HEADER_CONTACT.phone}</span>
          </a>
          <Link
            href={INTRODUCTORY_MEETING_ROUTE}
            aria-haspopup="dialog"
            className="hidden whitespace-nowrap rounded-full bg-mist-300 px-5 py-2.5 text-sm text-plum-800 transition hover:bg-mist-400 sm:inline-flex"
          >
            გაცნობითი შეხვედრა
          </Link>
          <button
            type="button"
            id="site-mobile-menu-trigger"
            aria-label="მენიუს გახსნა"
            aria-expanded={menuOpen}
            aria-controls={menuOpen ? 'site-mobile-menu' : undefined}
            onClick={() => setMenuOpen(true)}
            className="grid size-10 place-items-center rounded-full text-plum-800 transition hover:bg-cream-200 xl:hidden"
          >
            <Menu aria-hidden="true" className="size-6" strokeWidth={1.5} />
          </button>
        </div>
      </div>

      {menuOpen ? (
        <div ref={menuRef} id="site-mobile-menu" role="dialog" aria-modal="true" aria-label="მენიუ" className="fixed inset-0 z-50 flex flex-col bg-cream-100 xl:hidden">
          <div className="flex h-20 items-center justify-between px-4 sm:px-6">
            <Logo variant="header" />
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
            <a href={HEADER_CONTACT.phoneHref} className="mt-8 flex items-center gap-3 text-plum-700">
              <Phone aria-hidden="true" className="size-5" strokeWidth={1.5} />
              {HEADER_CONTACT.phone}
            </a>
            <Link
              href={INTRODUCTORY_MEETING_ROUTE}
              aria-haspopup="dialog"
              data-dialog-return-focus="site-mobile-menu-trigger"
              onClick={() => setMenuOpen(false)}
              className="mt-6 inline-flex whitespace-nowrap rounded-full bg-mist-300 px-5 py-2.5 text-sm text-plum-800 transition hover:bg-mist-400"
            >
              გაცნობითი შეხვედრა
            </Link>
          </nav>
        </div>
      ) : null}
    </header>
  );
}
