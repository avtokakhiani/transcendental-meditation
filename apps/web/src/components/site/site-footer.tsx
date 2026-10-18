import { Mail, MapPin, Phone } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { Logo } from './logo';
import { FacebookIcon, InstagramIcon, YoutubeIcon } from './social-icons';

const COLUMNS: ReadonlyArray<{ title: string; links: ReadonlyArray<{ label: string; href: Route }> }> = [
  {
    title: 'გვერდები',
    links: [
      { label: 'მთავარი', href: '/' },
      { label: 'ბლოგი', href: '/blog' },
      { label: 'წიგნები', href: '/books' },
    ],
  },
  {
    title: 'TM',
    links: [
      { label: 'როგორ ვსწავლობთ', href: '/#about' as Route },
      { label: 'სარგებელი', href: '/#benefits' as Route },
      { label: 'რატომ TM?', href: '/#why' as Route },
    ],
  },
];

const SOCIAL = [
  { label: 'Facebook', href: '#', Icon: FacebookIcon },
  { label: 'Instagram', href: '#', Icon: InstagramIcon },
  { label: 'YouTube', href: '#', Icon: YoutubeIcon },
] as const;

export function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-20 bg-plum-800 text-cream-200">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:px-10 lg:py-20">
        <div className="max-w-xs">
          <Logo tone="light" />
          <p className="mt-6 text-sm leading-7 text-cream-200/70">
            უძალისხმევო მედიტაციის ტექნიკა შინაგანი სიმშვიდისთვის. ვწერთ, ვთარგმნით და ვაზიარებთ
            ცოდნას ქართულ ენაზე.
          </p>
          <div className="mt-6 flex gap-2">
            {SOCIAL.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                aria-label={label}
                className="grid size-10 place-items-center rounded-full border border-cream-200/20 text-cream-200/80 transition hover:border-saffron-400 hover:text-saffron-300"
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <div key={column.title}>
            <h2 className="text-xs uppercase tracking-[0.22em] text-saffron-300">{column.title}</h2>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className="text-[15px] text-cream-200/85 transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        <div>
          <h2 className="text-xs uppercase tracking-[0.22em] text-saffron-300">კონტაქტი</h2>
          <ul className="mt-5 space-y-4 text-[15px] text-cream-200/85">
            <li>
              <a href={SITE.phoneHref} className="flex items-center gap-3 transition hover:text-white">
                <Phone aria-hidden="true" className="size-4 text-cream-200/50" strokeWidth={1.5} />
                {SITE.phone}
              </a>
            </li>
            <li>
              <a href={`mailto:${SITE.email}`} className="flex items-center gap-3 transition hover:text-white">
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
        <div className="mx-auto flex max-w-7xl flex-col gap-2 px-4 py-6 text-xs text-cream-200/50 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-10">
          <p>© {new Date().getFullYear()} {SITE.name}. ყველა უფლება დაცულია.</p>
          <p>შექმნილია სიმშვიდით თბილისში</p>
        </div>
      </div>
    </footer>
  );
}
