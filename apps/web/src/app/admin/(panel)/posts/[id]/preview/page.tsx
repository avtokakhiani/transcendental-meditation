import type { Metadata } from 'next';
import { notFound, redirect } from 'next/navigation';
import Link from 'next/link';
import { z } from 'zod';
import { requireUser } from '@/server/auth';
import { prisma } from '@/server/db';
import { RevisionArticle } from '@/components/articles/document-renderer';
import { INTRODUCTION_SLUG } from '@/lib/articles/authoring';
import { WhatIsTmIntro } from '@/app/(site)/blog/[slug]/what-is-tm-intro';
import { WhatIsTmNot } from '@/app/(site)/blog/[slug]/what-is-tm-not';
import { WhatIsTmDifferent } from '@/app/(site)/blog/[slug]/what-is-tm-different';
import { WhatIsTmRestfulAlertness } from '@/app/(site)/blog/[slug]/what-is-tm-restful-alertness';
import { WhatIsTmMaharishi } from '@/app/(site)/blog/[slug]/what-is-tm-maharishi';
import { WhatIsTmTonyNader } from '@/app/(site)/blog/[slug]/what-is-tm-tony-nader';
import intro from '@/app/(site)/blog/[slug]/what-is-tm.module.css';

export const dynamic = 'force-dynamic';
export const metadata: Metadata = { title: 'სტატიის კერძო წინასწარი ნახვა', robots: { index: false, follow: false } };
export default async function PreviewPage({ params, searchParams }: { params: Promise<{ id: string }>; searchParams: Promise<{ revision?: string }> }) {
  await requireUser();
  const [{ id }, { revision: requested }] = await Promise.all([params, searchParams]);
  if (!z.uuid().safeParse(id).success || requested && !z.uuid().safeParse(requested).success) notFound();
  const post = await prisma.post.findUnique({ where: { id }, select: { slug: true, draftRevisionId: true } });
  if (!post) notFound();
  const revisionId = requested ?? post.draftRevisionId;
  if (!revisionId) notFound();
  const revision = await prisma.postRevision.findFirst({ where: { id: revisionId, postId: id } });
  if (!revision) notFound();
  if (revision.document && JSON.parse(revision.document).blocks.some((block: {type: string}) => block.type === 'preserved')) redirect(`/admin/article-preview/${id}?revision=${revision.id}`);
  return <div className="mx-auto max-w-7xl"><div className="mb-8 rounded-2xl border border-cream-300 bg-white p-5 text-sm leading-7"><strong>კერძო წინასწარი ნახვა · ვერსია #{revision.number}</strong><p>ეს გვერდი მხოლოდ ავტორიზებული რედაქტორებისთვისაა ხელმისაწვდომი. ნაჩვენებია შენახული ვერსია.</p><Link href={`/admin/posts/${id}`} className="underline">რედაქტორში დაბრუნება</Link></div>
    {post.slug === INTRODUCTION_SLUG ? <><p className="mb-6 text-sm text-plum-500">ეს გვერდი ინარჩუნებს არსებულ სპეციალურ კომპონენტებს; მონახაზის მეტამონაცემები საჯარო გვერდს ჯერ არ ცვლის.</p><article className={intro.page}><WhatIsTmIntro imageUrl="/images/what-is-tm-water-waves.jpeg" /><WhatIsTmNot /><WhatIsTmDifferent /><WhatIsTmRestfulAlertness /><WhatIsTmMaharishi /><WhatIsTmTonyNader /></article></> : <RevisionArticle revision={revision} />}
  </div>;
}
