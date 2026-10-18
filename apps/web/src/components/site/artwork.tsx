/**
 * Placeholder illustrations drawn in the site palette so the layout reads well before real
 * photography exists. Swap a usage for an <img> once photos are uploaded.
 */
export type ArtworkVariant = 'dawn' | 'mountains' | 'heart' | 'moon' | 'circles' | 'horizon';

const SKIES: Record<ArtworkVariant, [string, string, string]> = {
  dawn: ['#f6e7d8', '#f3d9c4', '#e9c7b8'],
  mountains: ['#c9d9e6', '#e8dfe3', '#f4e2cf'],
  heart: ['#f4dcd6', '#f1e6dc', '#e7d4dc'],
  moon: ['#3b2f4a', '#5a4767', '#8a6e86'],
  circles: ['#e6dfeb', '#f2e8e1', '#f4dfc9'],
  horizon: ['#d6e4ee', '#eef0ea', '#f7ecd9'],
};

function Hills({ colors }: { colors: [string, string, string] }) {
  return (
    <>
      <path d="M0 330 C 90 290 170 300 250 320 S 400 280 480 300 L 480 480 L 0 480 Z" fill={colors[0]} />
      <path d="M0 370 C 120 340 200 360 300 350 S 420 330 480 345 L 480 480 L 0 480 Z" fill={colors[1]} />
      <path d="M0 410 C 140 390 260 420 360 400 S 450 395 480 400 L 480 480 L 0 480 Z" fill={colors[2]} />
    </>
  );
}

export function Artwork({
  variant,
  className = '',
  label,
}: {
  variant: ArtworkVariant;
  className?: string;
  label?: string;
}) {
  const [top, mid, bottom] = SKIES[variant];
  const id = `art-${variant}`;

  return (
    <svg
      viewBox="0 0 480 480"
      preserveAspectRatio="xMidYMid slice"
      role={label === undefined ? undefined : 'img'}
      aria-label={label}
      aria-hidden={label === undefined ? true : undefined}
      className={className}
    >
      <defs>
        <linearGradient id={`${id}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor={top} />
          <stop offset="0.55" stopColor={mid} />
          <stop offset="1" stopColor={bottom} />
        </linearGradient>
        <radialGradient id={`${id}-glow`}>
          <stop offset="0" stopColor="#fff6dc" stopOpacity="0.95" />
          <stop offset="0.45" stopColor="#f7d58e" stopOpacity="0.35" />
          <stop offset="1" stopColor="#f7d58e" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="480" height="480" fill={`url(#${id}-sky)`} />

      {variant === 'dawn' ? (
        <>
          <circle cx="250" cy="300" r="190" fill={`url(#${id}-glow)`} />
          <circle cx="250" cy="300" r="54" fill="#f6c968" opacity="0.85" />
          {[80, 110, 140].map((r) => (
            <circle key={r} cx="250" cy="300" r={r} fill="none" stroke="#fff" strokeOpacity="0.35" strokeWidth="1" />
          ))}
          <Hills colors={['#d9b9b4', '#b99aa6', '#8e7695']} />
        </>
      ) : null}

      {variant === 'mountains' ? (
        <>
          <circle cx="330" cy="150" r="120" fill={`url(#${id}-glow)`} />
          <path d="M0 330 L90 210 L150 270 L240 160 L330 260 L400 200 L480 280 L480 480 L0 480 Z" fill="#9db0c4" opacity="0.8" />
          <path d="M0 380 L120 290 L200 340 L300 270 L380 330 L480 300 L480 480 L0 480 Z" fill="#7d8fa8" opacity="0.85" />
          <path d="M0 430 C 120 400 240 440 480 410 L 480 480 L 0 480 Z" fill="#5f6d87" />
        </>
      ) : null}

      {variant === 'heart' ? (
        <>
          <circle cx="240" cy="230" r="170" fill={`url(#${id}-glow)`} />
          <path
            d="M240 330 C 150 270 120 220 140 180 C 160 140 215 140 240 185 C 265 140 320 140 340 180 C 360 220 330 270 240 330 Z"
            fill="#e2a9a4"
            opacity="0.55"
          />
          <polyline
            points="40,250 150,250 175,210 200,290 225,180 255,300 280,240 300,250 440,250"
            fill="none"
            stroke="#6b5272"
            strokeWidth="2.5"
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </>
      ) : null}

      {variant === 'moon' ? (
        <>
          {[[60, 70], [140, 40], [390, 90], [420, 180], [90, 170], [300, 60], [210, 120]].map(([x, y]) => (
            <circle key={`${x}-${y}`} cx={x} cy={y} r="1.6" fill="#fff" opacity="0.8" />
          ))}
          <circle cx="320" cy="170" r="110" fill={`url(#${id}-glow)`} opacity="0.6" />
          <circle cx="320" cy="170" r="46" fill="#f4e6c4" />
          <circle cx="340" cy="158" r="42" fill="#5a4767" />
          <Hills colors={['#6d5679', '#4f3d5b', '#33263c']} />
        </>
      ) : null}

      {variant === 'circles' ? (
        <>
          <circle cx="200" cy="230" r="110" fill="#c9b4cf" opacity="0.55" />
          <circle cx="285" cy="230" r="110" fill="#f0c88c" opacity="0.55" />
          <circle cx="242" cy="230" r="170" fill="none" stroke="#6b5272" strokeOpacity="0.2" />
          <circle cx="242" cy="230" r="210" fill="none" stroke="#6b5272" strokeOpacity="0.12" />
        </>
      ) : null}

      {variant === 'horizon' ? (
        <>
          <circle cx="240" cy="300" r="220" fill={`url(#${id}-glow)`} />
          <rect y="300" width="480" height="180" fill="#b4c9da" opacity="0.6" />
          {[320, 345, 375, 410, 450].map((y, index) => (
            <line key={y} x1={60 + index * 10} x2={420 - index * 10} y1={y} y2={y} stroke="#fff" strokeOpacity={0.6 - index * 0.1} />
          ))}
        </>
      ) : null}
    </svg>
  );
}
