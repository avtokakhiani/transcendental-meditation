function ClarityIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="24" cy="27" r="3.5" />
      <path d="M24 12v8M15 16l4.5 4.5M33 16l-4.5 4.5M9 27h8M31 27h8M18 32h12M20 36h8" />
    </svg>
  );
}

function CalmIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <path d="M9 18c4-3 8-3 12 0s8 3 12 0 6-2 6-2M9 24c4-3 8-3 12 0s8 3 12 0 6-2 6-2M9 31h30" />
    </svg>
  );
}

function RestIcon() {
  return (
    <svg viewBox="0 0 48 48" aria-hidden="true" className="size-12" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
      <circle cx="24" cy="19" r="4" />
      <path d="M13 28c3 5 7 7 11 7s8-2 11-7" />
    </svg>
  );
}

const BENEFITS = [
  { label: 'გონების სიცხადე და შემოქმედებითობა', Icon: ClarityIcon, tile: 'bg-mauve-200' },
  { label: 'ნაკლები სტრესი და შფოთვა', Icon: CalmIcon, tile: 'bg-mauve-100' },
  { label: 'უკეთესი ძილი და ჯანმრთელობა', Icon: RestIcon, tile: 'bg-[#e2d6d8]' },
] as const;

export function Benefits() {
  return (
    <section id="benefits" className="scroll-mt-20 bg-cream-100 pb-24">
      <div aria-hidden="true" className="dotted-y mx-auto h-20 w-0.5 text-plum-400" />
      <h2 className="mt-8 text-center text-sm text-plum-500">მეცნიერულად დადასტურებული სარგებელი</h2>

      <ul className="mx-auto mt-12 grid max-w-6xl gap-10 px-4 sm:px-6 md:grid-cols-3 md:gap-0">
        {BENEFITS.map(({ label, Icon, tile }, index) => (
          <li
            key={label}
            className={`flex items-center gap-5 md:justify-center md:px-5 ${
              index > 0 ? 'md:border-l md:border-dotted md:border-plum-300' : ''
            }`}
          >
            <span className={`grid size-20 shrink-0 place-items-center rounded-[1.75rem] text-plum-700 ${tile}`}>
              <Icon />
            </span>
            <span className="max-w-[12rem] text-lg leading-snug font-light text-plum-800">{label}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
