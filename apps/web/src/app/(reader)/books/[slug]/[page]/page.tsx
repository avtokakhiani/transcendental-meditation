import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { RichContent } from '@/components/rich-content';
import { ReaderShell } from '@/components/reader/reader-shell';
import { prisma } from '@/server/db';
import { getReaderBook } from '@/server/services/books';

export const dynamic = 'force-dynamic';

const load = cache((slug: string) => getReaderBook(prisma, slug));

/** The whole book renders on every page URL; the number only decides where the reader opens. */
async function resolve(params: Promise<{ slug: string; page: string }>) {
  const { slug, page } = await params;
  const number = Number(page);
  if (!Number.isInteger(number) || number < 1) return null;
  const data = await load(slug);
  if (data === null || number > data.pages.length) return null;
  return { ...data, initialPage: number };
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string; page: string }> }): Promise<Metadata> {
  const data = await resolve(params);
  if (data === null) return {};
  return { title: data.book.title, ...(data.book.author ? { authors: [{ name: data.book.author }] } : {}) };
}

export default async function ReaderPage({ params }: { params: Promise<{ slug: string; page: string }> }) {
  const data = await resolve(params);
  if (data === null) notFound();

  return (
    <ReaderShell
      slug={data.book.slug}
      bookTitle={data.book.title}
      initialPage={data.initialPage}
      pageCount={data.pages.length}
      toc={data.toc}
    >
      {data.pages.map((page) => (
        <section
          key={page.number}
          id={`page-${page.number}`}
          data-reader-page={page.number}
          aria-label={`გვერდი ${page.number}`}
          className="scroll-mt-24 rounded-sm bg-[var(--reader-bg)] px-6 pb-8 pt-12 font-serif shadow-[0_1px_2px_rgba(0,0,0,0.06),0_14px_32px_-16px_rgba(0,0,0,0.25)] sm:px-14 sm:pt-16"
        >
          {page.title !== null ? (
            <h2 className="mb-10 text-center font-sans text-3xl leading-snug font-light sm:text-[2.2rem]">{page.title}</h2>
          ) : null}
          <RichContent content={page.content} format={page.contentFormat} className="reader-text" />
          <p className="mt-12 text-center font-sans text-xs text-[var(--reader-muted)] tabular-nums">{page.number}</p>
        </section>
      ))}
    </ReaderShell>
  );
}
