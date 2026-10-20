import { Mail, MapPin, Phone } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { Logo } from './logo';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from './social-icons';

const COLUMNS: ReadonlyArray<{ id: string; title: string; links: ReadonlyArray<{ label: string; href: Route }> }> = [
  {
    id: 'footer-pages-heading',
    title: 'გვერდები',
    links: [
      { label: 'რა არის TM?', href: '/blog/ra-aris-transtsendentuli-meditatsia' as Route },
      { label: 'რატომ TM?', href: '/#why' as Route },
      { label: 'სტატიები', href: '/blog' },
      { label: 'წიგნები', href: '/books' },
    ],
  },
  {
    id: 'footer-learning-heading',
    title: 'სწავლება',
    links: [
      { label: 'როგორ ვისწავლოთ?', href: '/#contact' as Route },
      { label: 'გაეცანი TM-ს', href: '/blog/ra-aris-transtsendentuli-meditatsia' as Route },
      { label: 'სწავლებაზე ჩაწერა', href: '/#contact' as Route },
    ],
  },
];

const SOCIAL = [
  { label: 'Facebook', href: null as string | null, Icon: FacebookIcon },
  { label: 'Instagram', href: null as string | null, Icon: InstagramIcon },
  { label: 'YouTube', href: null as string | null, Icon: YoutubeIcon },
] as const;

const socialClass = 'grid size-10 place-items-center rounded-full border border-cream-200/20 text-cream-200/80 transition-colors hover:border-saffron-400 hover:text-saffron-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-saffron-300';
const linkClass = 'text-[15px] text-cream-200/85 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-saffron-300';

export function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-20 bg-plum-800 text-cream-200">
      <div className="mx-auto grid max-w-7xl gap-10 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:px-10 lg:py-14">
        <div className="max-w-xs">
          <Logo tone="light" />
          <p className="mt-5 text-sm leading-7 text-cream-200/70">
            ტრანსცენდენტული მედიტაციის შესახებ ცოდნა ქართულ ენაზე. გაეცანი ტექნიკას, სამეცნიერო კვლევებს, სტატიებსა და წიგნებს.
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIAL.map(({ label, href, Icon }) => (
              href !== null ? <a
                key={label}
                href={href}
                aria-label={label}
                className={socialClass}
              >
                <Icon />
              </a> : (
                <span key={label} role="img" aria-label={label} title={`${label} — ბმული ჯერ არ არის მითითებული`} className={socialClass}>
                  <Icon />
                </span>
              )
            ))}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-labelledby={column.id}>
            <h2 id={column.id} className="text-xs uppercase tracking-[0.22em] text-saffron-300">{column.title}</h2>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass}>
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>
        ))}

        <div>
          <h2 className="text-xs uppercase tracking-[0.22em] text-saffron-300">კონტაქტი</h2>
          <ul className="mt-5 space-y-4 text-[15px] text-cream-200/85">
            <li>
              <a href={SITE.phoneHref} className="flex items-center gap-3 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-saffron-300">
                <Phone aria-hidden="true" className="size-4 text-cream-200/50" strokeWidth={1.5} />
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-saffron-300">
                <Mail aria-hidden="true" className="size-4 text-cream-200/50" strokeWidth={1.5} />
                {SITE.email}
              </a>
            </li>
            <li className="flex items-center gap-3">
              <MapPin aria-hidden="true" className="size-4 text-cream-200/50" strokeWidth={1.5} />
              {SITE.address}
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-cream-200/10">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs leading-relaxed text-cream-200/70 sm:px-6 lg:flex-row lg:items-center lg:justify-between lg:px-10">
          <p>© 2026 learnTM.ge. ყველა უფლება დაცულია.</p>
          {/* Legal pages are not available yet; keep these labels unlinked until configured. */}
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <span>კონფიდენციალურობის პოლიტიკა</span>
            <span>გამოყენების პირობები</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
