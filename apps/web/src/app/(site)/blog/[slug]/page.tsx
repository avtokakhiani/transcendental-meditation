import { formatDateKa } from '@tm/shared';
import { ArrowLeft } from 'lucide-react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { preload } from 'react-dom';
import { RichContent } from '@/components/rich-content';
import { prisma } from '@/server/db';
import { getPublishedPost } from '@/server/services/posts';
import styles from './what-is-tm.module.css';
import { WhatIsTmIntro } from './what-is-tm-intro';
import { WhatIsTmNot } from './what-is-tm-not';

const INTRO_SLUG = 'ra-aris-transtsendentuli-meditatsia';
const INTRO_DESCRIPTION = 'რა არის ტრანსცენდენტული მედიტაცია, როგორ ისწავლება და რას აღწერს კვლევა? გაეცანი უძალისხმევო პრაქტიკას, მის ისტორიას და ცნობიერების შესახებ განმარტებებს.';

export const dynamic = 'force-dynamic';

// Shared between generateMetadata and the page so the post is fetched once per request.
const loadPost = cache((slug: string) => getPublishedPost(prisma, slug));

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const post = await loadPost((await params).slug);
  if (post === null) return {};
  const description = post.slug === INTRO_SLUG ? INTRO_DESCRIPTION : post.excerpt;
  return {
    title: post.title,
    description,
    openGraph: { title: post.title, description, type: 'article', ...(post.coverImageUrl ? { images: [post.coverImageUrl] } : {}) },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const post = await loadPost((await params).slug);
  if (post === null) notFound();
  const isIntroduction = post.slug === INTRO_SLUG;
  if (isIntroduction) preload('/images/what-is-tm-beach-original.jpeg', { as: 'image', fetchPriority: 'high' });
  // The photo introduction replaces the opening summary in this view only.
  // Keep the stored CMS summary intact for article cards and editing.
  const content = isIntroduction && post.contentFormat === 'html' && post.content.startsWith('<p>ტრანსცენდენტული მედიტაცია (TM)')
    ? post.content.replace(/^<p>[^<]*<\/p>\s*/, '')
    : post.content;
  // The dedicated section replaces this older passage in the page view only.
  // Leave the stored CMS content and all other article sections intact.
  const articleContent = isIntroduction && post.contentFormat === 'html'
    ? content.replace(/<h2>რას არ წარმოადგენს TM\?<\/h2>[\s\S]*?(?=<h2>|$)/, '')
    : content;

  return (
    <article className={isIntroduction ? styles.page : 'pb-24 pt-10 lg:pt-16'}>
      {isIntroduction ? <WhatIsTmIntro imageUrl="/images/what-is-tm-beach-original.jpeg" /> : null}
      {isIntroduction ? <WhatIsTmNot /> : null}
      <div className={`mx-auto max-w-3xl px-4 sm:px-6 ${isIntroduction ? styles.details : ''}`}>
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-plum-500 hover:text-plum-800">
          <ArrowLeft aria-hidden="true" className="size-4" />
          ბლოგი
        </Link>
        {!isIntroduction ? <h1 className="mt-8 text-[2.1rem] leading-tight font-light text-plum-800 sm:text-5xl sm:leading-[1.15]">{post.title}</h1> : null}
        <div className={`mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm ${isIntroduction ? 'text-plum-500' : 'text-plum-400'}`}>
          {post.authorName !== null ? <span>{post.authorName}</span> : null}
          {post.authorName !== null ? <span aria-hidden="true">·</span> : null}
          {post.publishedAt !== null ? <time dateTime={post.publishedAt.toISOString()}>{formatDateKa(post.publishedAt)}</time> : null}
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} წთ საკითხავი</span>
        </div>
      </div>

      {post.coverImageUrl !== null ? (
        <div className="mx-auto mt-12 max-w-5xl px-4 sm:px-6">
          <img src={post.coverImageUrl} alt="" className="aspect-[16/9] w-full rounded-3xl object-cover" />
        </div>
      ) : isIntroduction ? null : (
        <div aria-hidden="true" className="dotted-x mx-auto mt-12 h-1 max-w-3xl text-plum-300" />
      )}

      <div className={`mx-auto max-w-3xl px-4 sm:px-6 ${isIntroduction ? '' : 'mt-12'}`}>
        <RichContent content={articleContent} format={post.contentFormat} className={isIntroduction ? styles.body : 'prose-lg'} />
        {isIntroduction ? (
          <section aria-labelledby="tm-next-steps-heading" className={styles.nextSteps}>
            <h2 id="tm-next-steps-heading" className="text-xl leading-relaxed font-normal text-plum-800 sm:text-2xl">გსურს TM-ის სწავლა?</h2>
            <p className="mt-3 text-base leading-7 text-plum-500">გაეცანი სარგებლის მიმოხილვას ან დაგვიკავშირდი სწავლების შესახებ ინფორმაციის მისაღებად.</p>
            <div className="mt-5 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
              <Link href="/#contact" className="inline-flex min-h-14 items-center justify-center rounded-full bg-mist-300 px-7 py-4 text-[15px] text-plum-800 transition-colors hover:bg-mist-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-800">სწავლებაზე ჩაწერა</Link>
              <Link href="/#why" className="inline-flex min-h-11 items-center text-[15px] text-plum-700 underline decoration-plum-300 underline-offset-4 hover:decoration-plum-700">რატომ TM?</Link>
            </div>
          </section>
        ) : null}
      </div>
    </article>
  );
}
