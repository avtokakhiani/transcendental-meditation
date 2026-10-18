'use client';

import { Check, Copy, LoaderCircle, Upload } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useRef, useState } from 'react';
import { uploadImage } from './upload-image';
import { primaryButton } from './ui';

interface MediaItem {
  id: string;
  url: string;
  originalName: string;
  byteSize: number;
}

export function MediaLibrary({ items }: { items: MediaItem[] }) {
  const router = useRouter();
  const input = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  async function onFiles(files: FileList | null) {
    if (files === null || files.length === 0) return;
    setUploading(true);
    setError(null);
    try {
      for (const file of Array.from(files)) await uploadImage(file);
      router.refresh();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'ატვირთვა ვერ მოხერხდა');
    } finally {
      setUploading(false);
      if (input.current !== null) input.current.value = '';
    }
  }

  async function copy(item: MediaItem) {
    await navigator.clipboard.writeText(`![${item.originalName.replace(/\.[^.]+$/, '')}](${item.url})`);
    setCopied(item.id);
    setTimeout(() => setCopied((value) => (value === item.id ? null : value)), 1500);
  }

  return (
    <div className="mt-8">
      <button type="button" onClick={() => input.current?.click()} disabled={uploading} className={primaryButton}>
        {uploading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <Upload aria-hidden="true" className="size-4" />}
        სურათების ატვირთვა
      </button>
      <input ref={input} type="file" multiple accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={(event) => onFiles(event.target.files)} />
      {error !== null ? <p className="mt-3 text-sm text-rose-600">{error}</p> : null}

      {items.length === 0 ? (
        <p className="mt-8 rounded-3xl border border-dashed border-cream-300 p-12 text-center text-plum-400">სურათები ჯერ არ არის.</p>
      ) : (
        <ul className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {items.map((item) => (
            <li key={item.id} className="overflow-hidden rounded-2xl border border-cream-300 bg-cream-50">
              <img src={item.url} alt="" loading="lazy" className="aspect-[4/3] w-full bg-white object-cover" />
              <div className="flex items-center gap-2 p-3">
                <p className="min-w-0 flex-1 truncate text-xs text-plum-500" title={item.originalName}>
                  {item.originalName}
                </p>
                <button
                  type="button"
                  onClick={() => copy(item)}
                  title="Markdown ბმულის კოპირება"
                  aria-label="Markdown ბმულის კოპირება"
                  className="grid size-8 shrink-0 place-items-center rounded-lg text-plum-500 hover:bg-cream-200 hover:text-plum-900"
                >
                  {copied === item.id ? <Check aria-hidden="true" className="size-4 text-emerald-600" /> : <Copy aria-hidden="true" className="size-4" />}
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
