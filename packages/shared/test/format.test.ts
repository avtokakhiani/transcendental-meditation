import { describe, expect, it } from 'vitest';
import { contentToText, excerpt, formatDateKa, readingMinutes } from '../src/format';

describe('formatDateKa', () => {
  it('formats in Georgian', () => {
    expect(formatDateKa(new Date(Date.UTC(2026, 9, 18)))).toBe('18 ოქტომბერი, 2026');
  });
});

describe('readingMinutes', () => {
  it('never returns zero', () => {
    expect(readingMinutes('')).toBe(1);
  });

  it('scales with length', () => {
    expect(readingMinutes('სიტყვა '.repeat(900))).toBe(5);
  });
});

describe('excerpt', () => {
  it('strips markdown', () => {
    expect(excerpt('# სათაური\n\n**მუქი** [ბმული](https://x.ge) ![სურათი](/a.png)')).toBe(
      'სათაური მუქი ბმული',
    );
  });

  it('cuts on a word boundary', () => {
    const result = excerpt('ერთი ორი სამი ოთხი ხუთი ექვსი', 20);
    expect(result.endsWith('…')).toBe(true);
    expect(result.length).toBeLessThanOrEqual(21);
  });
});

describe('contentToText', () => {
  it('strips html and decodes entities', () => {
    expect(contentToText('<h2>სათაური</h2><p>ტექსტი &amp; <strong>მუქი</strong></p><img src="/a.png">', 'html')).toBe(
      'სათაური ტექსტი & მუქი',
    );
  });

  it('separates table cells and list items', () => {
    expect(contentToText('<table><tr><td>ა</td><td>ბ</td></tr></table><ul><li>გ</li><li>დ</li></ul>', 'html')).toBe('ა ბ გ დ');
  });

  it('excerpts html', () => {
    expect(excerpt('<p>ერთი ორი სამი</p>', 180, 'html')).toBe('ერთი ორი სამი');
  });
});
