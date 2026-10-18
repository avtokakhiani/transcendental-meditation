'use client';

import { ImagePlus, LoaderCircle, X } from 'lucide-react';
import { useRef, useState } from 'react';
import { uploadImage } from './upload-image';
import { labelClass } from './ui';

export function CoverField({ name = 'coverImageUrl', defaultValue = '', aspect = 'aspect-[16/9]' }: { name?: string; defaultValue?: string; aspect?: string }) {
  const [url, setUrl] = useState(defaultValue);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const input = useRef<HTMLInputElement>(null);

  async function onFile(file: File | undefined) {
    if (file === undefined) return;
    setUploading(true);
    setError(null);
    try {
      setUrl(await uploadImage(file));
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'ატვირთვა ვერ მოხერხდა');
    } finally {
      setUploading(false);
    }
  }

  return (
    <div>
      <span className={labelClass}>ყდის სურათი</span>
      <input type="hidden" name={name} value={url} />
      <div className={`relative mt-1.5 ${aspect} overflow-hidden rounded-2xl border border-dashed border-cream-300 bg-white`}>
        {url.length > 0 ? (
          <>
            <img src={url} alt="" className="size-full object-cover" />
            <button
              type="button"
              aria-label="სურათის წაშლა"
              onClick={() => setUrl('')}
              className="absolute right-2 top-2 grid size-8 place-items-center rounded-full bg-white/90 text-plum-700 shadow hover:bg-white"
            >
              <X aria-hidden="true" className="size-4" />
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => input.current?.click()}
            disabled={uploading}
            className="flex size-full flex-col items-center justify-center gap-2 text-sm text-plum-400 transition hover:bg-cream-50 hover:text-plum-700"
          >
            {uploading ? <LoaderCircle aria-hidden="true" className="size-6 animate-spin" /> : <ImagePlus aria-hidden="true" className="size-6" strokeWidth={1.5} />}
            {uploading ? 'იტვირთება…' : 'ატვირთვა'}
          </button>
        )}
      </div>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(event) => onFile(event.target.files?.[0])} />
      {error !== null ? <p className="mt-2 text-sm text-rose-600">{error}</p> : null}
    </div>
  );
}
