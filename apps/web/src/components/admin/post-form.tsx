'use client';

import { useActionState } from 'react';
import { savePostAction } from '@/app/admin/(panel)/posts/actions';
import { CoverField } from './cover-field';
import { FormMessages, type FormState, SubmitButton } from './form-feedback';
import { RichTextEditor } from './rich-text-editor';
import { StatusSelect } from './status-select';
import { TitleSlugFields } from './title-slug-fields';
import { cardClass, inputClass, labelClass } from './ui';

interface PostFormProps {
  post?: {
    id: string;
    title: string;
    slug: string;
    excerpt: string | null;
    coverImageUrl: string | null;
    content: string;
    contentFormat: string;
    status: string;
  };
  saved?: boolean;
}

const INITIAL: FormState = { error: null };

export function PostForm({ post, saved }: PostFormProps) {
  const [state, action] = useActionState(savePostAction, INITIAL);

  return (
    <form action={action} className="grid gap-6 xl:grid-cols-[1fr_20rem]">
      {post !== undefined ? <input type="hidden" name="id" value={post.id} /> : null}

      <div className="min-w-0 space-y-6">
        <FormMessages state={state} saved={saved} />
        <div className={cardClass}>
          <TitleSlugFields defaultTitle={post?.title} defaultSlug={post?.slug} urlPrefix="/blog/" />
        </div>
        <RichTextEditor name="content" defaultValue={post?.content} defaultFormat={post?.contentFormat ?? 'html'} minHeight="32rem" />
      </div>

      <aside className="space-y-6">
        <div className={`${cardClass} space-y-4`}>
          <StatusSelect defaultValue={post?.status} />
          <SubmitButton>შენახვა</SubmitButton>
        </div>
        <div className={`${cardClass} space-y-4`}>
          <CoverField defaultValue={post?.coverImageUrl ?? ''} />
          <label className={labelClass}>
            მოკლე აღწერა
            <textarea
              name="excerpt"
              rows={4}
              maxLength={500}
              defaultValue={post?.excerpt ?? ''}
              placeholder="ცარიელის შემთხვევაში ტექსტის დასაწყისი გამოჩნდება"
              className={inputClass}
            />
          </label>
        </div>
      </aside>
    </form>
  );
}
