const PALETTES = [
  ['#4a3352', '#8e7695', '#f3cf78'],
  ['#5f6d87', '#b4c9da', '#f8f5ea'],
  ['#8a5a4a', '#e2a9a4', '#f8f5ea'],
  ['#3b2742', '#e3ab2c', '#fcfaf3'],
] as const;

function hash(value: string): number {
  let result = 0;
  for (const char of value) result = (result * 31 + char.charCodeAt(0)) >>> 0;
  return result;
}

/** Uploaded cover when present; otherwise a generated one so the shelf never shows a gap. */
export function BookCover({
  title,
  author,
  coverImageUrl,
  className = '',
}: {
  title: string;
  author: string | null;
  coverImageUrl: string | null;
  className?: string;
}) {
  const base = `relative aspect-[2/3] overflow-hidden rounded-r-xl rounded-l-sm shadow-[0_18px_40px_-18px_rgba(42,27,48,0.55)] ${className}`;

  if (coverImageUrl !== null) {
    return <img src={coverImageUrl} alt={title} className={`${base} object-cover`} />;
  }

  const [bg, accent, ink] = PALETTES[hash(title) % PALETTES.length]!;
  return (
    <div className={base} style={{ background: bg, color: ink }} role="img" aria-label={title}>
      <div className="absolute inset-y-0 left-0 w-2.5 bg-black/15" />
      <svg viewBox="0 0 100 100" className="absolute -right-10 -top-10 size-48 opacity-50" aria-hidden="true">
        {[18, 28, 38, 48].map((r) => (
          <circle key={r} cx="50" cy="50" r={r} fill="none" stroke={accent} strokeWidth="0.8" />
        ))}
        <circle cx="50" cy="50" r="8" fill={accent} />
      </svg>
      <div className="absolute inset-x-0 bottom-0 p-5">
        <p className="font-serif text-xl leading-snug">{title}</p>
        {author !== null ? <p className="mt-2 text-xs opacity-75">{author}</p> : null}
      </div>
    </div>
  );
}
