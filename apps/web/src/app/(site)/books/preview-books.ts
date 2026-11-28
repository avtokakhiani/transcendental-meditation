import type { BookCard } from '@/server/services/books';

// TEMPORARY: Books-page layout samples only; never written to the database.
// Remove this file and its import/spread in page.tsx to remove the preview books.
export const PREVIEW_BOOKS: BookCard[] = ([
  ['ცნობიერების გზა', 'ნინო მელაძე', 184],
  ['შინაგანი სივრცე', 'გიორგი ლომიძე', 216],
  ['მშვიდი დილა', 'მარიამ ბერიძე', 128],
  ['მედიტაციის ხელოვნება', 'დავით კობახიძე', 240],
  ['საკუთარი თავის შეცნობა', 'ელენე აბაშიძე', 192],
  ['სიჩუმის ძალა', 'ლუკა მაისურაძე', 156],
  ['ყოველდღიური ჰარმონია', 'ანა წერეთელი', 208],
] as const).map(([title, author, pageCount], index) => ({
  id: `preview-book-${index + 1}`,
  slug: `preview-book-${index + 1}`,
  title,
  author: `${author} · დროებითი ნიმუში`,
  description: 'დროებითი წიგნი განლაგების სანახავად.',
  coverImageUrl: null, // Reuse BookCover's existing title-based placeholder covers.
  pageCount,
}));
