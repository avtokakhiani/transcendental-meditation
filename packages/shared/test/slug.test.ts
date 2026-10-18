import { describe, expect, it } from 'vitest';
import { slugify } from '../src/slug';

describe('slugify', () => {
  it('transliterates Georgian', () => {
    expect(slugify('ტრანსცენდენტული მედიტაცია')).toBe('transtsendentuli-meditatsia');
    expect(slugify('ღრმა შვება და ჯანმრთელობა')).toBe('ghrma-shveba-da-janmrteloba');
  });

  it('keeps latin and digits and collapses punctuation', () => {
    expect(slugify('  TM: 20 წუთი — დღეში!  ')).toBe('tm-20-tsuti-dgheshi');
  });

  it('strips accents', () => {
    expect(slugify('Café Méditation')).toBe('cafe-meditation');
  });

  it('returns empty string when nothing is sluggable', () => {
    expect(slugify('—!?')).toBe('');
  });
});
