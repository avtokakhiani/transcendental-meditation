'use client';

import { ArrowLeft, MoveHorizontal, PanelLeftClose, PanelLeftOpen, Type, X } from 'lucide-react';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import type { TocEntry } from '@/server/services/books';
import { saveLastPage } from './reading-progress';
import {
  DEFAULT_PREFS,
  MAX_SIZE,
  MAX_WIDTH,
  MIN_SIZE,
  MIN_WIDTH,
  PREFS_BOOT_SCRIPT,
  READER_THEMES,
  type ReaderPrefs,
  type ReaderTheme,
  loadPrefs,
  savePrefs,
} from './reader-prefs';

const THEME_LABELS: Record<ReaderTheme, string> = { light: 'ღია', sepia: 'სეპია', dark: 'მუქი' };
const THEME_SWATCH: Record<ReaderTheme, string> = {
  light: 'bg-[#fcfaf3] text-[#3b2742]',
  sepia: 'bg-[#f4ead7] text-[#4b3a2a]',
  dark: 'bg-[#241c28] text-[#e6dde8]',
};

/** A page counts as "current" once its top passes this fraction of the viewport. */
const CURRENT_PAGE_LINE = 0.35;

interface ReaderShellProps {
  slug: string;
  bookTitle: string;
  initialPage: number;
  pageCount: number;
  toc: TocEntry[];
  /** Server-rendered page sheets, each a section with data-reader-page and id="page-N". */
  children: React.ReactNode;
}

function pageElement(number: number): HTMLElement | null {
  return document.getElementById(`page-${number}`);
}

function TocList({
  toc,
  currentPage,
  pageCount,
  onSelect,
}: {
  toc: TocEntry[];
  currentPage: number;
  pageCount: number;
  onSelect: (page: number) => void;
}) {
  if (toc.length === 0) {
    return <p className="px-4 py-3 text-sm text-[var(--reader-muted)]">სარჩევი ცარიელია.</p>;
  }

  return (
    <ol className="space-y-0.5">
      {toc.map((entry, index) => {
        const nextStart = toc[index + 1]?.number ?? pageCount + 1;
        const current = currentPage >= entry.number && currentPage < nextStart;
        return (
          <li key={entry.number}>
            <button
              type="button"
              onClick={() => onSelect(entry.number)}
              aria-current={current ? 'location' : undefined}
              className={`flex w-full items-baseline justify-between gap-4 rounded-xl px-4 py-2.5 text-left text-[14px] leading-snug transition hover:bg-[var(--reader-line)] ${
                current ? 'bg-[var(--reader-line)] font-medium' : ''
              }`}
            >
              <span>{entry.title}</span>
              <span className="shrink-0 text-xs text-[var(--reader-muted)] tabular-nums">{entry.number}</span>
            </button>
          </li>
        );
      })}
    </ol>
  );
}

export function ReaderShell({ slug, bookTitle, initialPage, pageCount, toc, children }: ReaderShellProps) {
  const [prefs, setPrefs] = useState<ReaderPrefs>(DEFAULT_PREFS);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [progress, setProgress] = useState(0);
  const prefsLoaded = useRef(false);
  const userScrolled = useRef(false);

  const chapterTitle = toc.filter((entry) => entry.number <= currentPage).at(-1)?.title ?? null;

  useEffect(() => {
    setPrefs(loadPrefs());
    prefsLoaded.current = true;
  }, []);

  useEffect(() => {
    if (prefsLoaded.current) savePrefs(prefs);
  }, [prefs]);

  // Open at the page in the URL. Re-applied once web fonts load, since they change page heights,
  // unless the reader has already started scrolling.
  useEffect(() => {
    if (initialPage <= 1) return;
    const jump = () => {
      if (!userScrolled.current) pageElement(initialPage)?.scrollIntoView({ block: 'start', behavior: 'instant' });
    };
    jump();
    const markScrolled = () => (userScrolled.current = true);
    const events = ['wheel', 'touchmove', 'keydown', 'mousedown'] as const;
    events.forEach((name) => window.addEventListener(name, markScrolled, { passive: true, once: true }));
    void document.fonts.ready.then(jump);
    return () => events.forEach((name) => window.removeEventListener(name, markScrolled));
  }, [initialPage]);

  // Track which page is on screen and how far through the book the reader is.
  useEffect(() => {
    let frame = 0;
    const update = () => {
      frame = 0;
      const line = window.innerHeight * CURRENT_PAGE_LINE;
      let visible = 1;
      for (const element of document.querySelectorAll<HTMLElement>('[data-reader-page]')) {
        if (element.getBoundingClientRect().top <= line) visible = Number(element.dataset.readerPage);
        else break;
      }
      setCurrentPage(visible);
      const scrollable = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(scrollable > 0 ? Math.min(100, (window.scrollY / scrollable) * 100) : 100);
    };
    const onScroll = () => {
      if (frame === 0) frame = requestAnimationFrame(update);
    };
    update();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
    };
  }, []);

  // Keep the URL and the remembered position on the page being read, without adding history entries.
  useEffect(() => {
    saveLastPage(slug, currentPage);
    const url = `/books/${slug}/${currentPage}`;
    if (window.location.pathname !== url) window.history.replaceState(window.history.state, '', url);
  }, [slug, currentPage]);

  function goTo(page: number) {
    userScrolled.current = true;
    setDrawerOpen(false);
    pageElement(page)?.scrollIntoView({ block: 'start', behavior: 'smooth' });
  }

  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        setSettingsOpen(false);
        setDrawerOpen(false);
        return;
      }
      const target = event.target as HTMLElement;
      if (event.altKey || event.ctrlKey || event.metaKey || target.closest('input, textarea, select')) return;
      if (event.key === 'ArrowRight' && currentPage < pageCount) goTo(currentPage + 1);
      if (event.key === 'ArrowLeft' && currentPage > 1) goTo(currentPage - 1);
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [currentPage, pageCount]);

  function toggleToc() {
    if (window.matchMedia('(min-width: 1024px)').matches) setPrefs({ ...prefs, tocOpen: !prefs.tocOpen });
    else setDrawerOpen(true);
  }

  const iconButton =
    'grid size-10 shrink-0 place-items-center rounded-full text-[var(--reader-fg)] transition hover:bg-[var(--reader-line)]';

  return (
    <div
      data-reader-theme={prefs.theme}
      data-reader-size={prefs.size}
      data-reader-width={prefs.width}
      data-reader-toc={prefs.tocOpen ? 'open' : 'closed'}
      suppressHydrationWarning
      className="min-h-dvh bg-[var(--reader-desk)] text-[var(--reader-fg)] transition-colors duration-300"
    >
      <script dangerouslySetInnerHTML={{ __html: PREFS_BOOT_SCRIPT }} />

      <header className="sticky top-0 z-20 border-b border-[var(--reader-line)] bg-[var(--reader-bg)]/95 backdrop-blur">
        <div className="flex h-16 items-center gap-1 px-2 sm:gap-2 sm:px-4">
          <button
            type="button"
            onClick={toggleToc}
            aria-label={prefs.tocOpen ? 'სარჩევის დამალვა' : 'სარჩევის ჩვენება'}
            title="სარჩევი"
            className={iconButton}
          >
            <PanelLeftClose aria-hidden="true" className="hidden size-5 lg:[[data-reader-toc=open]_&]:block" strokeWidth={1.5} />
            <PanelLeftOpen aria-hidden="true" className="size-5 lg:[[data-reader-toc=open]_&]:hidden" strokeWidth={1.5} />
          </button>
          <Link href={`/books/${slug}`} aria-label="წიგნის გვერდზე დაბრუნება" title="წიგნის გვერდი" className={iconButton}>
            <ArrowLeft aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </Link>
          <div className="min-w-0 flex-1 px-2 text-center">
            <p className="truncate text-sm">{bookTitle}</p>
            {chapterTitle !== null ? <p className="truncate text-xs text-[var(--reader-muted)]">{chapterTitle}</p> : null}
          </div>
          <span className="hidden shrink-0 px-2 text-sm text-[var(--reader-muted)] tabular-nums sm:inline" aria-live="polite">
            {currentPage} / {pageCount}
          </span>
          <button
            type="button"
            aria-label="კითხვის პარამეტრები"
            aria-expanded={settingsOpen}
            onClick={() => setSettingsOpen((open) => !open)}
            className={iconButton}
          >
            <Type aria-hidden="true" className="size-5" strokeWidth={1.5} />
          </button>
        </div>
        <div className="h-0.5 bg-[var(--reader-line)]">
          <div className="h-full bg-saffron-500" style={{ width: `${progress}%` }} />
        </div>

        {settingsOpen ? (
          <div className="absolute right-3 top-full mt-2 w-72 rounded-2xl border border-[var(--reader-line)] bg-[var(--reader-bg)] p-5 shadow-2xl sm:right-4">
            <p className="text-xs text-[var(--reader-muted)]">შრიფტის ზომა</p>
            <div className="mt-3 flex items-center justify-between gap-3">
              <button
                type="button"
                disabled={prefs.size <= MIN_SIZE}
                onClick={() => setPrefs({ ...prefs, size: prefs.size - 1 })}
                aria-label="შრიფტის შემცირება"
                className="grid h-10 flex-1 place-items-center rounded-full border border-[var(--reader-line)] text-sm disabled:opacity-40"
              >
                ა−
              </button>
              <span className="w-8 text-center text-sm tabular-nums">{prefs.size + 1}</span>
              <button
                type="button"
                disabled={prefs.size >= MAX_SIZE}
                onClick={() => setPrefs({ ...prefs, size: prefs.size + 1 })}
                aria-label="შრიფტის გაზრდა"
                className="grid h-10 flex-1 place-items-center rounded-full border border-[var(--reader-line)] text-lg disabled:opacity-40"
              >
                ა+
              </button>
            </div>
            {/* Phones always use the full screen width, so the control only shows where it has an effect. */}
            <div className="hidden sm:block">
              <p className="mt-5 text-xs text-[var(--reader-muted)]">გვერდის სიგანე</p>
              <div className="mt-3 flex items-center gap-3">
                <MoveHorizontal aria-hidden="true" className="size-4 shrink-0 text-[var(--reader-muted)]" strokeWidth={1.5} />
                <input
                  type="range"
                  min={MIN_WIDTH}
                  max={MAX_WIDTH}
                  step={1}
                  value={prefs.width}
                  onChange={(event) => setPrefs({ ...prefs, width: Number(event.target.value) })}
                  aria-label="გვერდის სიგანე"
                  aria-valuetext={prefs.width === MAX_WIDTH ? 'სრული სიგანე' : `${prefs.width + 1} / ${MAX_WIDTH + 1}`}
                  className="h-1.5 flex-1 cursor-pointer accent-saffron-500"
                />
                <span className="w-12 text-center text-sm tabular-nums">{prefs.width === MAX_WIDTH ? 'სრული' : prefs.width + 1}</span>
              </div>
            </div>
            <p className="mt-5 text-xs text-[var(--reader-muted)]">ფონი</p>
            <div className="mt-3 grid grid-cols-3 gap-2">
              {READER_THEMES.map((theme) => (
                <button
                  key={theme}
                  type="button"
                  aria-pressed={prefs.theme === theme}
                  onClick={() => setPrefs({ ...prefs, theme })}
                  className={`rounded-xl border px-2 py-3 text-sm ${THEME_SWATCH[theme]} ${
                    prefs.theme === theme ? 'border-saffron-500 ring-2 ring-saffron-500/40' : 'border-black/10'
                  }`}
                >
                  {THEME_LABELS[theme]}
                </button>
              ))}
            </div>
          </div>
        ) : null}
      </header>

      <div className="flex">
        <aside
          aria-label="სარჩევი"
          className="reader-toc sticky top-[66px] hidden h-[calc(100dvh-66px)] w-72 shrink-0 overflow-y-auto border-r border-[var(--reader-line)] bg-[var(--reader-bg)] px-3 py-6 lg:block"
        >
          <p className="px-4 pb-3 text-[11px] uppercase tracking-[0.22em] text-[var(--reader-muted)]">სარჩევი</p>
          <TocList toc={toc} currentPage={currentPage} pageCount={pageCount} onSelect={goTo} />
        </aside>

        <main className="min-w-0 flex-1 px-3 py-6 sm:px-6 sm:py-10">
          <div className="reader-column space-y-6 sm:space-y-8">{children}</div>
          <div className="reader-column mt-12 pb-16 text-center">
            <p className="font-serif text-lg text-[var(--reader-muted)]">დასასრული ✦</p>
            <Link
              href={`/books/${slug}`}
              className="mt-5 inline-flex rounded-full border border-[var(--reader-line)] px-6 py-3 text-sm transition hover:bg-[var(--reader-line)]"
            >
              წიგნის გვერდზე დაბრუნება
            </Link>
          </div>
        </main>
      </div>

      {drawerOpen ? (
        <div className="fixed inset-0 z-30 lg:hidden" role="dialog" aria-modal="true" aria-label="სარჩევი">
          <button type="button" aria-label="დახურვა" onClick={() => setDrawerOpen(false)} className="absolute inset-0 bg-black/30" />
          <aside className="absolute inset-y-0 left-0 flex w-[min(20rem,86vw)] flex-col bg-[var(--reader-bg)] shadow-2xl">
            <div className="flex h-16 items-center justify-between border-b border-[var(--reader-line)] px-5">
              <p className="text-sm">სარჩევი</p>
              <button type="button" aria-label="დახურვა" onClick={() => setDrawerOpen(false)} className={iconButton}>
                <X aria-hidden="true" className="size-5" strokeWidth={1.5} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-3">
              <TocList toc={toc} currentPage={currentPage} pageCount={pageCount} onSelect={goTo} />
            </div>
          </aside>
        </div>
      ) : null}
    </div>
  );
}
