import Link from 'next/link';

// Rounded so server and browser produce identical attribute strings (float output differs by engine).
const round = (value: number) => Math.round(value * 1000) / 1000;

const RAYS = Array.from({ length: 56 }, (_, index) => {
  const angle = (index / 56) * Math.PI * 2;
  // Alternating ray lengths give the mark a gentle, breathing texture.
  const inner = index % 2 === 0 ? 5.5 : 8;
  const outer = index % 4 === 0 ? 19 : 17;
  return {
    x1: round(20 + Math.cos(angle) * inner),
    y1: round(20 + Math.sin(angle) * inner),
    x2: round(20 + Math.cos(angle) * outer),
    y2: round(20 + Math.sin(angle) * outer),
  };
});

export function LogoMark({ className = 'size-10' }: { className?: string }) {
  return (
    <svg viewBox="0 0 40 40" aria-hidden="true" className={className}>
      <circle cx="20" cy="20" r="19.25" fill="none" stroke="currentColor" strokeWidth="0.6" opacity="0.5" />
      {RAYS.map((ray, index) => (
        <line
          key={index}
          {...ray}
          stroke="currentColor"
          strokeWidth="0.7"
          strokeLinecap="round"
          opacity={index % 2 === 0 ? 0.95 : 0.55}
        />
      ))}
      <circle cx="20" cy="20" r="2.2" fill="currentColor" />
    </svg>
  );
}

export function Logo({ tone = 'dark' }: { tone?: 'dark' | 'light' }) {
  const color = tone === 'dark' ? 'text-plum-800' : 'text-cream-100';
  return (
    <Link
      href="/"
      aria-label="მთავარ გვერდზე გადასვლა"
      className={`flex items-center gap-3 rounded-md ${color} transition hover:opacity-80 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-saffron-500`}
    >
      <LogoMark className="size-11 shrink-0" />
      <span className="text-[15px] leading-[1.15] font-normal tracking-tight">
        ტრანსცენდენტული
        <br />
        მედიტაცია
      </span>
    </Link>
  );
}
