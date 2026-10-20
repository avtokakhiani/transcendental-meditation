'use server';

import { bookInputSchema, bookPageInputSchema } from '@tm/shared';
import { revalidatePath } from 'next/cache';
import { redirect } from 'next/navigation';
import { z } from 'zod';
import type { FormState } from '@/components/admin/form-feedback';
import { requireUser } from '@/server/auth';
import { prisma } from '@/server/db';
import {
  addBookPage,
  deleteBook,
  deleteBookPage,
  isBookSlugTaken,
  moveBookPage,
  saveBook,
  setFeaturedBook,
  updateBookPage,
} from '@/server/services/books';

function read(formData: FormData, key: string): string {
  const value = formData.get(key);
  return typeof value === 'string' ? value : '';
}

export async function saveFeaturedBookAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  if (!formData.has('featuredBookId')) return { error: 'აირჩიე გამოქვეყნებული წიგნი ან ვარიანტი „წიგნის გარეშე“.' };
  const value = read(formData, 'featuredBookId');
  if (value !== '' && !z.string().uuid().safeParse(value).success) return { error: 'აირჩიე გამოქვეყნებული წიგნი.' };
  if (!(await setFeaturedBook(prisma, value || null))) return { error: 'ეს წიგნი აღარ არის გამოქვეყნებული. აირჩიე სხვა წიგნი.' };
  revalidatePath('/');
  revalidatePath('/admin/books');
  redirect('/admin/books?featuredSaved=1');
}

export async function saveBookAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const id = read(formData, 'id') || undefined;

  const parsed = bookInputSchema.safeParse({
    title: read(formData, 'title'),
    slug: read(formData, 'slug'),
    author: read(formData, 'author'),
    description: read(formData, 'description'),
    coverImageUrl: read(formData, 'coverImageUrl'),
    status: read(formData, 'status'),
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'მონაცემები არასწორია' };

  if (await isBookSlugTaken(prisma, parsed.data.slug, id)) {
    return { error: 'ეს მისამართი უკვე გამოყენებულია სხვა წიგნში' };
  }

  const saved = await saveBook(prisma, parsed.data, id);
  revalidatePath('/', 'layout');
  redirect(`/admin/books/${saved.id}?saved=1`);
}

export async function deleteBookAction(formData: FormData): Promise<void> {
  await requireUser();
  const id = read(formData, 'id');
  if (id.length > 0) await deleteBook(prisma, id);
  revalidatePath('/', 'layout');
  redirect('/admin/books');
}

export async function saveBookPageAction(_previous: FormState, formData: FormData): Promise<FormState> {
  await requireUser();
  const bookId = read(formData, 'bookId');
  const pageId = read(formData, 'pageId') || undefined;

  const parsed = bookPageInputSchema.safeParse({
    title: read(formData, 'title'),
    content: read(formData, 'content'),
    contentFormat: read(formData, 'contentFormat') || 'markdown',
    status: read(formData, 'status') || 'published',
  });
  if (!parsed.success) return { error: parsed.error.issues[0]?.message ?? 'მონაცემები არასწორია' };

  const book = await prisma.book.findUnique({ where: { id: bookId }, select: { id: true } }).catch(() => null);
  if (book === null) return { error: 'წიგნი ვერ მოიძებნა' };

  let targetId = pageId;
  if (pageId === undefined) {
    targetId = (await addBookPage(prisma, bookId, parsed.data)).id;
  } else {
    await updateBookPage(prisma, bookId, pageId, parsed.data);
  }

  revalidatePath('/', 'layout');
  if (read(formData, 'intent') === 'next') redirect(`/admin/books/${bookId}/pages/new`);
  redirect(`/admin/books/${bookId}/pages/${targetId}?saved=1`);
}

export async function deleteBookPageAction(formData: FormData): Promise<void> {
  await requireUser();
  const bookId = read(formData, 'bookId');
  await deleteBookPage(prisma, bookId, read(formData, 'pageId'));
  revalidatePath('/', 'layout');
  redirect(`/admin/books/${bookId}`);
}

export async function moveBookPageAction(formData: FormData): Promise<void> {
  await requireUser();
  const bookId = read(formData, 'bookId');
  const direction = read(formData, 'direction') === 'up' ? 'up' : 'down';
  await moveBookPage(prisma, bookId, read(formData, 'pageId'), direction);
  revalidatePath('/', 'layout');
}
