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
import { WhatIsTmDifferent } from './what-is-tm-different';
import { WhatIsTmRestfulAlertness } from './what-is-tm-restful-alertness';
import { WhatIsTmMaharishi } from './what-is-tm-maharishi';
import { WhatIsTmTonyNader } from './what-is-tm-tony-nader';

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

  if (isIntroduction) {
    return (
      <article className={styles.page}>
        <WhatIsTmIntro imageUrl="/images/what-is-tm-beach-original.jpeg" />
        <WhatIsTmNot />
        <WhatIsTmDifferent />
        <WhatIsTmRestfulAlertness />
        <WhatIsTmMaharishi />
        <WhatIsTmTonyNader />
      </article>
    );
  }

  return (
    <article className="pb-24 pt-10 lg:pt-16">
      <div className="mx-auto max-w-3xl px-4 sm:px-6">
        <Link href="/blog" className="inline-flex items-center gap-2 text-sm text-plum-500 hover:text-plum-800">
          <ArrowLeft aria-hidden="true" className="size-4" />
          ბლოგი
        </Link>
        <h1 className="mt-8 text-[2.1rem] leading-tight font-light text-plum-800 sm:text-5xl sm:leading-[1.15]">{post.title}</h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-plum-400">
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
      ) : (
        <div aria-hidden="true" className="dotted-x mx-auto mt-12 h-1 max-w-3xl text-plum-300" />
      )}

      <div className="mx-auto mt-12 max-w-3xl px-4 sm:px-6">
        <RichContent content={post.content} format={post.contentFormat} className="prose-lg" />
      </div>
    </article>
  );
}
