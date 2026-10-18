'use client';

import { useActionState } from 'react';
import { saveBookPageAction } from '@/app/admin/(panel)/books/actions';
import { FormMessages, type FormState, SubmitButton } from './form-feedback';
import { RichTextEditor } from './rich-text-editor';
import { cardClass, inputClass, labelClass, secondaryButton } from './ui';

const INITIAL: FormState = { error: null };

export function BookPageForm({
  bookId,
  page,
  saved,
}: {
  bookId: string;
  page?: { id: string; title: string | null; content: string; contentFormat: string };
  saved?: boolean;
}) {
  const [state, action] = useActionState(saveBookPageAction, INITIAL);

  return (
    <form action={action} className="space-y-6">
      <input type="hidden" name="bookId" value={bookId} />
      {page !== undefined ? <input type="hidden" name="pageId" value={page.id} /> : null}
      <FormMessages state={state} saved={saved} />
      <div className={cardClass}>
        <label className={labelClass}>
          თავის სათაური <span className="text-plum-400">(არასავალდებულო — სათაურიანი გვერდები სარჩევში ჩანს)</span>
          <input name="title" defaultValue={page?.title ?? ''} placeholder="მაგ. თავი 1. დასაწყისი" className={inputClass} />
        </label>
      </div>
      <RichTextEditor name="content" defaultValue={page?.content} defaultFormat={page?.contentFormat ?? 'html'} minHeight="30rem" />
      <div className="flex flex-wrap gap-3">
        <SubmitButton>შენახვა</SubmitButton>
        {page === undefined ? (
          <button type="submit" name="intent" value="next" className={secondaryButton}>
            შენახვა და შემდეგი გვერდი
          </button>
        ) : null}
      </div>
    </form>
  );
}
