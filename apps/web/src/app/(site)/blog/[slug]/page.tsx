import { PostArticle } from '@/components/post-article';
import { StandardArticle } from './standard-article';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { cache } from 'react';
import { preload } from 'react-dom';
import { prisma } from '@/server/db';
import { getPublishedPost } from '@/server/services/posts';
import styles from './what-is-tm.module.css';
import { WhatIsTmIntro } from './what-is-tm-intro';
import { WhatIsTmNot } from './what-is-tm-not';
import { WhatIsTmDifferent } from './what-is-tm-different';
import { WhatIsTmRestfulAlertness } from './what-is-tm-restful-alertness';
import { WhatIsTmMaharishi } from './what-is-tm-maharishi';
import { WhatIsTmTonyNader } from './what-is-tm-tony-nader';
import { getArticle } from '@/content/articles';
import { StressArticleHero } from './stress-article-hero';
import { HeartArticleHero } from './heart-article-hero';
import { SleepArticleHero } from './sleep-article-hero';

const INTRO_SLUG = 'ra-aris-transtsendentuli-meditatsia';
const INTRO_DESCRIPTION =
  'რა არის ტრანსცენდენტული მედიტაცია, როგორ ისწავლება და რას აღწერს კვლევა? გაეცანი უძალისხმევო პრაქტიკას, მის ისტორიას და ცნობიერების შესახებ განმარტებებს.';

export const dynamic = 'force-dynamic';

// Shared between generateMetadata and the page so the post is fetched once per request.
const loadPost = cache((slug: string) => getPublishedPost(prisma, slug));

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (article) return { title: article.title, description: article.description };
  const post = await loadPost(slug);
  if (post === null) return {};
  const description = post.slug === INTRO_SLUG ? INTRO_DESCRIPTION : post.excerpt;
  return {
    title: post.title,
    description,
    openGraph: {
      title: post.title,
      description,
      type: 'article',
      ...(post.coverImageUrl ? { images: [post.coverImageUrl] } : {}),
    },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (article) {
    if (article.slug === 'meditatsia-stresis-shesamtsireblad' && article.image) {
      return <StressArticleHero title="მედიტაცია სტრესის შესამცირებლად" image={article.image} />;
    }
    if (article.slug === 'gulis-janmrteloba-da-meditatsia' && article.image) {
      return <HeartArticleHero title="გულის ჯანმრთელობა და მედიტაცია" image={article.image} />;
    }
    if (article.slug === 'meditatsia-uketesi-dzilistvis' && article.image) {
      return <SleepArticleHero title="მედიტაცია უკეთესი ძილისთვის" image={article.image} />;
    }
    return <StandardArticle article={article} />;
  }
  const post = await loadPost(slug);
  if (post === null) notFound();
  const isIntroduction = post.slug === INTRO_SLUG;
  if (isIntroduction)
    preload('/images/what-is-tm-water-waves.jpeg', { as: 'image', fetchPriority: 'high' });

  if (isIntroduction) {
    return (
      <article className={styles.page}>
        <WhatIsTmIntro imageUrl="/images/what-is-tm-water-waves.jpeg" />
        <WhatIsTmNot />
        <WhatIsTmDifferent />
        <WhatIsTmRestfulAlertness />
        <WhatIsTmMaharishi />
        <WhatIsTmTonyNader />
      </article>
    );
  }

  return <PostArticle post={post} />;
}
