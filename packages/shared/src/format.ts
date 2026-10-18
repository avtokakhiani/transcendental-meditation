const GEORGIAN_MONTHS = [
  'იანვარი', 'თებერვალი', 'მარტი', 'აპრილი', 'მაისი', 'ივნისი',
  'ივლისი', 'აგვისტო', 'სექტემბერი', 'ოქტომბერი', 'ნოემბერი', 'დეკემბერი',
] as const;

/**
 * Formatted by hand because ICU's `ka` month names vary between Node and browser builds, which
 * would make server-rendered dates mismatch on hydration.
 */
export function formatDateKa(date: Date): string {
  return `${date.getUTCDate()} ${GEORGIAN_MONTHS[date.getUTCMonth()]}, ${date.getUTCFullYear()}`;
}

/** Georgian adult silent-reading speed is closer to 180 wpm than English's 230. */
const WORDS_PER_MINUTE = 180;

export function readingMinutes(text: string): number {
  const words = text.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.round(words / WORDS_PER_MINUTE));
}

const ENTITIES: Readonly<Record<string, string>> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'", nbsp: ' ' };

function markdownToText(markdown: string): string {
  return markdown
    .replace(/!\[[^\]]*]\([^)]*\)/g, '')
    .replace(/\[([^\]]*)]\([^)]*\)/g, '$1')
    .replace(/^#{1,6}\s+/gm, '')
    .replace(/^>\s?/gm, '')
    .replace(/[*_`~]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function htmlToText(html: string): string {
  return html
    .replace(/<(br|\/p|\/h[1-6]|\/li|\/td|\/th|\/div|\/blockquote)[^>]*>/gi, ' ')
    .replace(/<[^>]+>/g, '')
    .replace(/&(amp|lt|gt|quot|#39|nbsp);/g, (_, name: string) => ENTITIES[name] ?? '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Readable text of stored content in either format, for excerpts, search and reading time. */
export function contentToText(content: string, format: 'markdown' | 'html' = 'markdown'): string {
  return format === 'html' ? htmlToText(content) : markdownToText(content);
}

/** Plain-text preview, for cards and meta descriptions. */
export function excerpt(content: string, maxLength = 180, format: 'markdown' | 'html' = 'markdown'): string {
  const plain = contentToText(content, format);

  if (plain.length <= maxLength) return plain;
  const cut = plain.slice(0, maxLength);
  const lastSpace = cut.lastIndexOf(' ');
  return `${(lastSpace > maxLength * 0.6 ? cut.slice(0, lastSpace) : cut).trimEnd()}…`;
}
