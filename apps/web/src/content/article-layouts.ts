/** Published CMS articles with an established pre-standard design.
 * This compatibility list is intentionally closed: every new slug uses the shared layout.
 * The custom introduction has its own finalized sections and is handled by the route.
 */
const legacyPostSlugs = new Set([
  'mshvidi-dzili',
  'meditatsia-da-urtiertobebi',
  'pirveli-kvira',
  'stresi-da-kortizoli',
]);

export function getPostArticleLayout(slug: string): 'standard' | 'legacy' {
  return legacyPostSlugs.has(slug) ? 'legacy' : 'standard';
}
