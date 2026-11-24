import { z } from 'zod';
import { articleLayoutSchema, safeLinkSchema } from './document';

const optionalText = (max: number) => z.string().trim().max(max).nullable().transform(value => value || null);
export const coverCropSchema = z.enum(['center', 'top', 'bottom']);
export const articleInputSchema = z.strictObject({
  title: z.string().trim().min(1, 'შეიყვანეთ სტატიის სათაური').max(300),
  slug: z.string().max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, 'მისამართში გამოიყენეთ ლათინური ასოები, ციფრები და ტირე'),
  displayHeading: optionalText(300), cardTitle: optionalText(300), excerpt: optionalText(500), cardExcerpt: optionalText(500),
  editorialByline: optionalText(300), category: optionalText(150), coverImageUrl: z.string().max(2048).nullable().refine(value => !value || /^(https?:\/\/|\/images\/|\/api\/media\/)/.test(value) && safeLinkSchema.safeParse(value).success, 'სურათის მისამართი არასწორია').transform(value => value || null),
  coverImageAlt: optionalText(1000), coverCrop: coverCropSchema,
  seoTitle: optionalText(300), seoDescription: optionalText(2000), layoutKey: articleLayoutSchema,
  body: z.discriminatedUnion('format', [
    z.strictObject({ format: z.literal('document'), serialized: z.string().max(1_000_000) }),
    z.strictObject({ format: z.enum(['html', 'markdown']), serialized: z.string().max(400_000) }),
  ]),
});
export type ArticleInput = z.infer<typeof articleInputSchema>;
export const INTRODUCTION_SLUG = 'ra-aris-transtsendentuli-meditatsia';
