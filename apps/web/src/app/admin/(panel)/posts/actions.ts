'use server';

import { postInputSchema } from '@tm/shared';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import type { FormState } from '@/components/admin/form-feedback';
import { requireUser } from '@/server/auth';
import { prisma } from '@/server/db';
import { deletePost, isPostSlugTaken, savePost } from '@/server/services/posts';

function read(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function savePostAction(_previous: FormState, formData: FormData): Promise<FormState> {
  const user = await requireUser();
  const id = read(formData, 'id') || undefined;

  const parsed = postInputSchema.safeParse({
    title: read(formData, 'title'),
    slug: read(formData, 'slug'),
    excerpt: read(formData, 'excerpt'),
    coverImageUrl: read(formData, 'coverImageUrl'),
    content: read(formData, 'content'),
    contentFormat: read(formData, 'contentFormat') || 'markdown',
    status: read(formData, 'status'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'მონაცემები არასწორია' };

  if (await isPostSlugTaken(prisma, parsed.data.slug, id)) {
    return { error: 'ეს მისამართი უკვე გამოყენებულია სხვა პოსტში' };
  }

  const saved = await savePost(prisma, parsed.data, { ...(id === undefined ? {} : { id }), authorId: user.id });

  revalidatePath('/', 'layout');
  redirect(`/admin/posts/${saved.id}?saved=1`);
}

export async function deletePostAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = read(formData, 'id');
  if (id.length > 0) await deletePost(prisma, id);
  revalidatePath('/', 'layout');
  redirect('/admin/posts');
}
