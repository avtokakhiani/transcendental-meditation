import { Mail, MapPin, Phone } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { SITE } from '@/lib/site';
import { INTRODUCTORY_MEETING_ROUTE } from '@/lib/routes';
import { externalLinkProps } from '@/lib/links';
import { Logo } from './logo';
import { FacebookIcon, WhatsAppIcon } from './social-icons';

const COLUMNS: ReadonlyArray<{ id: string; title: string; links: ReadonlyArray<{ label: string; href: Route }> }> = [
  {
    id: 'footer-pages-heading',
    title: 'გვერდები',
    links: [
      { label: 'რა არის TM?', href: '/blog/ra-aris-transtsendentuli-meditatsia' as Route },
      { label: 'რატომ TM?', href: '/benefits' as Route },
      { label: 'სტატიები', href: '/blog' },
      { label: 'წიგნები', href: '/books' },
      { label: 'ორგანიზაციებისთვის', href: '/organizaciebitvis' as Route },
    ],
  },
  {
    id: 'footer-learning-heading',
    title: 'სწავლება',
    links: [
      { label: 'როგორ ვისწავლო?', href: '/how-to-learn' as Route },
      { label: 'გაცნობითი შეხვედრა', href: INTRODUCTORY_MEETING_ROUTE },
    ],
  },
];

const SOCIAL = [
  { label: 'ჩვენი Facebook ჯგუფი', href: 'https://www.facebook.com/groups/learntm', Icon: FacebookIcon },
  { label: 'მოგვწერე WhatsApp-ზე', href: 'https://wa.me/995511308939', Icon: WhatsAppIcon },
] as const;

const socialClass = 'grid size-10 place-items-center rounded-full border border-cream-200/20 text-cream-200/80 transition-colors hover:border-saffron-400 hover:text-saffron-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-saffron-300';
const linkClass = 'inline-block py-0.5 text-[15px] text-cream-200/85 transition-colors hover:text-white focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-saffron-300';

export function SiteFooter() {
  return (
    <footer id="contact" className="scroll-mt-20 bg-plum-800 text-cream-200">
      <div className="mx-auto grid max-w-7xl items-start gap-x-10 gap-y-9 px-4 py-12 sm:px-6 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1.3fr] lg:px-10 lg:py-14">
        <div className="max-w-xs">
          <Logo tone="light" />
          <p className="mt-5 text-sm leading-7 text-cream-200/70">
            ტრანსცენდენტული მედიტაციის შესახებ ინფორმაცია და საგანმანათლებლო მასალები ქართულ ენაზე — სტატიები, სამეცნიერო კვლევები და წიგნები.
          </p>
          <div className="mt-5 flex gap-2">
            {SOCIAL.map(({ label, href, Icon }) => (
              <a
                key={label}
                href={href}
                {...externalLinkProps(href)}
                aria-label={label}
                title={label}
                className={socialClass}
              >
                <Icon />
              </a>
            ))}
          </div>
        </div>

        {COLUMNS.map((column) => (
          <nav key={column.title} aria-labelledby={column.id}>
            <h2 id={column.id} className="text-xs uppercase tracking-[0.22em] text-saffron-300">{column.title}</h2>
            <ul className="mt-5 space-y-3">
              {column.links.map((link) => (
                <li key={link.label}>
                  <Link href={link.href} className={linkClass} data-meeting-panel={link.href === INTRODUCTORY_MEETING_ROUTE ? true : undefined}>
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
          <div className="flex flex-wrap gap-x-6 gap-y-2">
            <Link href={'/privacy-policy' as Route} className="hover:text-white focus-visible:outline-2 focus-visible:outline-saffron-300">კონფიდენციალურობის პოლიტიკა</Link>
            <Link href={'/terms-of-use' as Route} className="hover:text-white focus-visible:outline-2 focus-visible:outline-saffron-300">გამოყენების პირობები</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
