import Link from 'next/link';

export function LogoMark({ className = 'size-10' }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={`block bg-current ${className}`}
      style={{
        maskImage: 'url(/tm-logo-midnight.svg)',
        maskSize: 'contain',
        maskPosition: 'center',
        maskRepeat: 'no-repeat',
      }}
    />
  );
}

export function Logo({
  tone = 'dark',
  variant = 'default',
}: {
  tone?: 'dark' | 'light';
  variant?: 'default' | 'header';
}) {
  const color = tone === 'dark' ? 'text-plum-800' : 'text-cream-100';
  const isHeader = variant === 'header';
  return (
    <Link
      href="/"
      aria-label="მთავარ გვერდზე გადასვლა"
      className={`flex items-center gap-3 rounded-md ${color} ${isHeader ? 'shrink-0' : 'transition hover:opacity-80'} focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-saffron-500`}
    >
      <LogoMark className={`${isHeader ? 'size-[42px]' : 'size-11'} shrink-0`} />
      <span
        className={isHeader
          ? 'text-[20px] leading-none font-medium tracking-[-0.3px] whitespace-nowrap'
          : 'text-[15px] leading-[1.15] font-normal tracking-tight'}
      >
        learnTM
      </span>
    </Link>
  );
}
