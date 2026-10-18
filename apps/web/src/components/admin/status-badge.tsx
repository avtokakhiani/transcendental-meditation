import { type ContentStatus, ContentStatusLabel } from '@tm/shared';

export function StatusBadge({ status }: { status: string }) {
  const published = status === 'published';
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs ${
        published ? 'bg-emerald-50 text-emerald-800' : 'bg-cream-200 text-plum-500'
      }`}
    >
      <span className={`size-1.5 rounded-full ${published ? 'bg-emerald-500' : 'bg-plum-300'}`} />
      {ContentStatusLabel[status as ContentStatus] ?? status}
    </span>
  );
}
