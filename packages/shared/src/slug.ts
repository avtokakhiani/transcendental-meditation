/** National transliteration system (2002), the one Georgian road signs and passports use. */
const GEORGIAN_TO_LATIN: Readonly<Record<string, string>> = {
  ა: 'a', ბ: 'b', გ: 'g', დ: 'd', ე: 'e', ვ: 'v', ზ: 'z', თ: 't', ი: 'i', კ: 'k',
  ლ: 'l', მ: 'm', ნ: 'n', ო: 'o', პ: 'p', ჟ: 'zh', რ: 'r', ს: 's', ტ: 't', უ: 'u',
  ფ: 'p', ქ: 'k', ღ: 'gh', ყ: 'q', შ: 'sh', ჩ: 'ch', ც: 'ts', ძ: 'dz', წ: 'ts', ჭ: 'ch',
  ხ: 'kh', ჯ: 'j', ჰ: 'h',
};

export const SLUG_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const MAX_SLUG_LENGTH = 120;

/**
 * Latin-only slugs keep URLs readable when shared: a Georgian path is percent-encoded into an
 * unreadable string by most messengers and social networks.
 */
export function slugify(value: string): string {
  const transliterated = Array.from(value.toLowerCase())
    .map((char) => GEORGIAN_TO_LATIN[char] ?? char)
    .join('');

  return transliterated
    .normalize('NFKD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, MAX_SLUG_LENGTH)
    .replace(/-+$/g, '');
}
