import { z } from 'zod';
import { type ComponentRegistry } from './component-registry';
import { parseArticleDocument } from './document';

const revisionBodySchema = z.discriminatedUnion('contentFormat', [
  z.strictObject({ contentFormat: z.enum(['markdown', 'html']), content: z.string().max(400_000), document: z.null(), documentVersion: z.null() }),
  z.strictObject({ contentFormat: z.literal('document'), content: z.literal(''), document: z.string().max(1_000_000), documentVersion: z.literal(1) }),
]);

/** Exactly one authoritative body per revision. No changes to the shared book/editor formats. */
export function validateRevisionBody(input: unknown, registry?: ComponentRegistry) {
  const body = revisionBodySchema.parse(input);
  if (body.contentFormat === 'document') parseArticleDocument(body.document, registry);
  return body;
}

export const postSlugAliasSchema = z.strictObject({
  slug: z.string().min(1).max(120).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  postId: z.uuid(),
});
// Alias creation checks canonical slugs and aliases under matching transaction range locks.
