'use client';

import { useActionState } from 'react';
import { saveBookAction } from '@/app/admin/(panel)/books/actions';
import { CoverField } from './cover-field';
import { FormMessages, type FormState, SubmitButton } from './form-feedback';
import { StatusSelect } from './status-select';
import { TitleSlugFields } from './title-slug-fields';
import { cardClass, inputClass, labelClass } from './ui';

interface BookFormProps {
  book?: {
    id: string;
    title: string;
    slug: string;
    author: string | null;
    description: string | null;
    coverImageUrl: string | null;
    status: string;
  };
  saved?: boolean;
}

const INITIAL: FormState = { error: null };

export function BookForm({ book, saved }: BookFormProps) {
  const [state, action] = useActionState(saveBookAction, INITIAL);

  return (
    <form action={action} className="grid gap-6 lg:grid-cols-[1fr_16rem]">
      {book !== undefined ? <input type="hidden" name="id" value={book.id} /> : null}
      <div className="min-w-0 space-y-6">
        <FormMessages state={state} saved={saved} />
        <div className={`${cardClass} space-y-4`}>
          <TitleSlugFields defaultTitle={book?.title} defaultSlug={book?.slug} urlPrefix="/books/" />
          <label className={labelClass}>
            ავტორი
            <input name="author" defaultValue={book?.author ?? ''} className={inputClass} />
          </label>
          <label className={labelClass}>
            აღწერა
            <textarea name="description" rows={5} maxLength={4000} defaultValue={book?.description ?? ''} className={inputClass} />
          </label>
        </div>
      </div>
      <aside className="space-y-6">
        <div className={`${cardClass} space-y-4`}>
          <StatusSelect defaultValue={book?.status} />
          <SubmitButton>შენახვა</SubmitButton>
        </div>
        <div className={cardClass}>
          <CoverField defaultValue={book?.coverImageUrl ?? ''} aspect="aspect-[2/3]" />
        </div>
      </aside>
    </form>
  );
}
