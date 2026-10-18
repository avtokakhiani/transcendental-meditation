'use client';

import { slugify } from '@tm/shared';
import { useState } from 'react';
import { inputClass, labelClass } from './ui';

/** Slug follows the title until the editor types into it, so renaming a published item never breaks its link. */
export function TitleSlugFields({ defaultTitle = '', defaultSlug = '', urlPrefix }: { defaultTitle?: string; defaultSlug?: string; urlPrefix: string }) {
  const [title, setTitle] = useState(defaultTitle);
  const [slug, setSlug] = useState(defaultSlug);
  const [slugTouched, setSlugTouched] = useState(defaultSlug.length > 0);

  return (
    <div className="space-y-4">
      <label className={labelClass}>
        სათაური
        <input
          name="title"
          required
          value={title}
          onChange={(event) => {
            setTitle(event.target.value);
            if (!slugTouched) setSlug(slugify(event.target.value));
          }}
          className={`${inputClass} text-lg`}
        />
      </label>
      <label className={labelClass}>
        მისამართი (URL)
        <div className="mt-1.5 flex items-center overflow-hidden rounded-xl border border-cream-300 bg-white focus-within:border-plum-400">
          <span className="shrink-0 border-r border-cream-300 bg-cream-50 px-3 py-2.5 text-sm text-plum-400">{urlPrefix}</span>
          <input
            name="slug"
            required
            value={slug}
            onChange={(event) => {
              setSlugTouched(true);
              setSlug(event.target.value);
            }}
            onBlur={() => setSlug((value) => slugify(value))}
            className="min-w-0 flex-1 px-3 py-2.5 text-[15px] text-plum-900 outline-none"
          />
        </div>
      </label>
    </div>
  );
}
