import { z } from 'zod';
import { SLUG_PATTERN } from './slug';

export const CONTENT_STATUSES = ['draft', 'published'] as const;
export type ContentStatus = (typeof CONTENT_STATUSES)[number];

/** Legacy content is Markdown; everything saved from the rich editor is HTML. */
export const CONTENT_FORMATS = ['markdown', 'html'] as const;
export type ContentFormat = (typeof CONTENT_FORMATS)[number];

export const ContentStatusLabel: Record<ContentStatus, string> = {
  draft: 'მონახაზი',
  published: 'გამოქვეყნებული',
};

const slugSchema = z
  .string()
  .trim()
  .min(1, 'მისამართი სავალდებულოა')
  .max(120)
  .regex(SLUG_PATTERN, 'მისამართი: მხოლოდ ლათინური ასოები, ციფრები და ტირე');

const optionalUrl = z
  .string()
  .trim()
  .max(2048)
  .transform((value) => (value.length === 0 ? null : value));

export const postInputSchema = z.object({
  title: z.string().trim().min(1, 'სათაური სავალდებულოა').max(300),
  slug: slugSchema,
  excerpt: z.string().trim().max(500).transform((value) => (value.length === 0 ? null : value)),
  coverImageUrl: optionalUrl,
  content: z.string().max(400_000),
  contentFormat: z.enum(CONTENT_FORMATS),
  status: z.enum(CONTENT_STATUSES),
});
export type PostInput = z.infer<typeof postInputSchema>;

export const bookInputSchema = z.object({
  title: z.string().trim().min(1, 'სათაური სავალდებულოა').max(300),
  slug: slugSchema,
  author: z.string().trim().max(200).transform((value) => (value.length === 0 ? null : value)),
  description: z.string().trim().max(4000).transform((value) => (value.length === 0 ? null : value)),
  coverImageUrl: optionalUrl,
  status: z.enum(CONTENT_STATUSES),
});
export type BookInput = z.infer<typeof bookInputSchema>;

export const bookPageInputSchema = z.object({
  title: z.string().trim().max(300).transform((value) => (value.length === 0 ? null : value)),
  content: z.string().max(400_000),
  contentFormat: z.enum(CONTENT_FORMATS),
});
export type BookPageInput = z.infer<typeof bookPageInputSchema>;
