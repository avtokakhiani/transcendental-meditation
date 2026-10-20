'use client';

import { useActionState } from 'react';
import { saveFeaturedBookAction } from '@/app/admin/(panel)/books/actions';
import { FormMessages, SubmitButton } from './form-feedback';
import { cardClass, inputClass, labelClass } from './ui';

export function FeaturedBookForm({ books, selectedId, saved }: {
  books: Array<{ id: string; title: string; status: string }>;
  selectedId: string | null;
  saved: boolean;
}) {
  const [state, action] = useActionState(saveFeaturedBookAction, { error: null });
  const selected = books.find((book) => book.id === selectedId);
  const unavailable = selectedId !== null && selected?.status !== 'published';

  return (
    <form action={action} className={`${cardClass} mt-6 space-y-4`}>
      <h2 className="text-lg text-plum-900">მთავარ გვერდზე გამორჩეული წიგნი</h2>
      <p className="text-sm leading-6 text-plum-500">არჩეული წიგნი მთავარ გვერდზე დარჩება, სანამ არჩევანს თავად არ შეცვლი. ახალი წიგნის გამოქვეყნება მას არ ჩაანაცვლებს.</p>
      <FormMessages state={state} saved={saved} />
      <label className={labelClass}>
        გამორჩეული წიგნი
        <select name="featuredBookId" defaultValue={selectedId ?? ''} className={inputClass}>
          <option value="">წიგნის გარეშე</option>
          {unavailable ? <option value={selectedId!} disabled>{selected?.title ?? 'მიუწვდომელი წიგნი'} — გამოუქვეყნებელია</option> : null}
          {books.filter((book) => book.status === 'published').map((book) => <option key={book.id} value={book.id}>{book.title}</option>)}
        </select>
      </label>
      {unavailable ? <p className="text-sm text-plum-500">არჩეული წიგნი დროებით არ ჩანს მთავარ გვერდზე. შეგიძლია ხელახლა გამოაქვეყნო ან აირჩიო სხვა წიგნი.</p> : null}
      <SubmitButton>არჩევანის შენახვა</SubmitButton>
    </form>
  );
}
