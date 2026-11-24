'use server';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { FormState } from '@/components/admin/form-feedback';
import { articleInputSchema } from '@/lib/articles/authoring';
import { requireUser } from '@/server/auth';
import { prisma } from '@/server/db';
import { ArticleConflict, ArticleValidation, changeArticle } from '@/server/services/article-revisions';
const read = (data: FormData, key: string) => typeof data.get(key) === 'string' ? String(data.get(key)) : '';
const intentSchema = z.enum(['save', 'publish', 'restore', 'unpublish', 'reconcile', 'alias']);
export async function savePostAction(_previous: FormState, data: FormData): Promise<FormState> {
  const user = await requireUser();
  let id: string;
  try {
    const intent = intentSchema.parse(read(data, 'intent') || 'save');
    const input = intent === 'save' || intent === 'publish' ? articleInputSchema.parse({
      ...Object.fromEntries(['title', 'slug', 'displayHeading', 'cardTitle', 'excerpt', 'cardExcerpt', 'editorialByline', 'category', 'coverImageUrl', 'coverImageAlt', 'coverCrop', 'seoTitle', 'seoDescription', 'layoutKey'].map(key => [key, read(data, key)])),
      body: { format: read(data, 'bodyFormat'), serialized: read(data, 'body') },
    }) : undefined;
    const saved = await changeArticle(prisma, { id: read(data, 'id') || undefined, expectedVersion: z.coerce.number().int().nonnegative().parse(read(data, 'version')), expectedLegacyToken: read(data, 'legacyToken'), actorId: user.id, intent, input, revisionId: read(data, 'revisionId') || undefined, aliasSlug: read(data,'aliasSlug') || undefined });
    id = saved.id;
  } catch (error) {
    if (error instanceof ArticleConflict || error instanceof ArticleValidation) return { error: error.message };
    if (error instanceof z.ZodError) {
      const labels: Record<string, string> = { title: 'სათაური', summary: 'ვიზუალური კომპონენტის ტექსტური აღწერა', alt: 'სურათის ალტერნატიული ტექსტი', rows: 'გრაფიკის მონაცემები', label: 'მაჩვენებლის დასახელება', value: 'მაჩვენებლის მნიშვნელობა', url: 'წყაროს ბმული', coverImageAlt: 'სურათის ალტერნატიული ტექსტი', slug: 'სტატიის მისამართი' };
      const field = error.issues[0]?.path.map(String).reverse().find(key => labels[key]);
      return { error: field ? `შეავსეთ ან შეასწორეთ ველი: ${labels[field]}.` : 'შეამოწმეთ სურათები, გრაფიკის მონაცემები და წყაროები. ყველა მითითებული წყარო უნდა არსებობდეს.' };
    }
    if (typeof error === 'object' && error && 'code' in error && error.code === 'P2002') return { error: 'ეს მისამართი უკვე გამოიყენება. აირჩიეთ სხვა მისამართი.' };
    return { error: 'სტატია ვერ შეინახა. ცვლილებები ფორმაში დარჩა; სცადეთ ხელახლა.' };
  }
  revalidatePath('/', 'layout');
  redirect(`/admin/posts/${id}?saved=1`);
}
export async function deletePostAction(data: FormData): Promise<void> {
  const user = await requireUser();
  await changeArticle(prisma, { id: read(data, 'id'), expectedVersion: Number(read(data, 'version')), expectedLegacyToken: read(data, 'legacyToken'), actorId: user.id, intent: 'delete' });
  revalidatePath('/', 'layout');
  redirect('/admin/posts');
}
