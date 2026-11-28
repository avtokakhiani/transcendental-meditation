import type { ReactNode } from 'react';
import { RelatedArticles } from '@/components/related-articles';

export const dynamic = 'force-dynamic';

/** Appended after every article's existing content/CTA, before the site footer. */
export default async function ArticleLayout({
  children,
  params,
}: {
  children: ReactNode;
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  return (
    <>
      {children}
      <RelatedArticles currentSlug={slug} />
    </>
  );
}
