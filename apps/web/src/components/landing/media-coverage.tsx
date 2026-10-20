import { ExternalLink } from 'lucide-react';
import Image from 'next/image';
import headingStyles from './section-heading.module.css';

const PUBLICATIONS = [
  {
    name: 'Forbes',
    logo: '/images/media/forbes.svg',
    logoWidth: 140,
    logoHeight: 38,
    description:
      'Forbes-ის სტატია ტრანსცენდენტული მედიტაციის პოპულარობის ზრდის, მისი გავრცელებისა და დევიდ ლინჩის ფონდის საქმიანობის შესახებ.',
    href: 'https://www.forbes.com/sites/alicegwalton/2015/04/27/transcendental-meditation-makes-a-comeback-with-the-aim-of-giving-back/',
  },
  {
    name: 'Axios',
    logo: '/images/media/axios.svg',
    logoWidth: 130,
    logoHeight: 33,
    description:
      'Axios-ის სტატია ტრანსცენდენტული მედიტაციის, მისი შესწავლის გამოცდილებისა და სტრესთან დაკავშირებული კვლევების შესახებ.',
    href: 'https://www.axios.com/2022/04/21/transcendental-meditation-mental-health-wellness',
  },
  {
    name: 'Cleveland Clinic',
    logo: '/images/media/cleveland-clinic.svg',
    logoWidth: 190,
    logoHeight: 30,
    description:
      'Cleveland Clinic-ის სამედიცინო მიმოხილვა ტრანსცენდენტული მედიტაციის ტექნიკის, სწავლების პროცესისა და შესაძლო სარგებლის შესახებ.',
    href: 'https://my.clevelandclinic.org/health/treatments/22292-transcendental-meditation',
  },
] as const;

export function MediaCoverage() {
  return (
    <section
      aria-labelledby="media-coverage-heading"
      className="bg-cream-100 pt-6 pb-8 sm:pt-7 sm:pb-10"
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-10">
        <h2
          id="media-coverage-heading"
          className={headingStyles.heading}
        >
          ტრანსცენდენტული მედიტაცია მედიაში
        </h2>
        <div aria-hidden="true" className="mx-auto mt-3 h-0.5 w-12 bg-saffron-500" />

        <ul className="mt-5 grid auto-rows-fr gap-4 md:grid-cols-3 lg:gap-6">
          {PUBLICATIONS.map(({ name, logo, logoWidth, logoHeight, description, href }, index) => (
            <li key={name} className="min-w-0">
              <a
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-labelledby={`media-publication-${index} media-link-${index}`}
                className="group flex h-full flex-col rounded-xl border border-cream-300 bg-cream-50 p-5 text-plum-800 transition-colors hover:border-plum-300 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-700"
              >
                <h3
                  id={`media-publication-${index}`}
                  lang="en"
                  className="flex min-h-10 items-center justify-center"
                >
                  <Image
                    src={logo}
                    alt={name}
                    width={logoWidth}
                    height={logoHeight}
                    unoptimized
                    className="h-auto max-w-full"
                  />
                </h3>
                <p className="mt-4 text-[15px] leading-6 font-normal">{description}</p>
                <span
                  id={`media-link-${index}`}
                  className="mt-auto flex items-center gap-2 pt-4 text-sm text-plum-700 underline decoration-plum-300 underline-offset-4 group-hover:decoration-plum-700"
                >
                  <span>
                    სტატიის წაკითხვა <span aria-hidden="true">→</span>
                  </span>
                  <ExternalLink aria-hidden="true" className="size-4 shrink-0" strokeWidth={1.5} />
                  <span className="sr-only">(იხსნება ახალ ჩანართში)</span>
                </span>
              </a>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
