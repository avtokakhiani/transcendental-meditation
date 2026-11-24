import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { z } from 'zod';
import { requireUser } from '@/server/auth';
import { prisma } from '@/server/db';
import { SiteHeader } from '@/components/site/site-header';
import { SiteFooter } from '@/components/site/site-footer';
import { MeetingPanel } from '@/components/meetings/meeting-panel';
import { PrivacyModal, TermsModal } from '@/components/privacy/privacy-modal';
import { RelatedArticles } from '@/components/related-articles';
import { RevisionArticle } from '@/components/articles/document-renderer';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'სტატიის კერძო წინასწარი ნახვა', robots: { index: false, follow: false } };
/** Full-viewport authenticated proof of the approved geometry, with unchanged site chrome. */
export default async function MigratedPreview({ params, searchParams }: { params: Promise<{id: string}>; searchParams: Promise<{revision?: string}> }) {
  await requireUser();
  const [{id}, {revision: requested}] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success || requested && !z.uuid().safeParse(requested).success) notFound();
  const post = await prisma.post.findUnique({where: {id}});
  if (!post) notFound();
  const revision = await prisma.postRevision.findFirst({where: {id: requested ?? post.draftRevisionId ?? '', postId: id}});
  if (!revision?.document || !JSON.parse(revision.document).blocks.some((block: {type: string}) => block.type === 'preserved')) notFound();
  return <><a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[60] focus:rounded-full focus:bg-plum-800 focus:px-5 focus:py-3 focus:text-cream-100">შინაარსზე გადასვლა</a><SiteHeader previewPathname={`/blog/${post.slug}`}/><main id="main"><RevisionArticle revision={revision}/><RelatedArticles currentSlug={post.slug}/></main><SiteFooter/><MeetingPanel/><PrivacyModal/><TermsModal/></>;
}
