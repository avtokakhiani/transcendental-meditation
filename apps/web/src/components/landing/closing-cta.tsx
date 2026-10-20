import { ArrowRight } from 'lucide-react';
import type { Route } from 'next';
import Link from 'next/link';
import { LogoMark } from '@/components/site/logo';

export function ClosingCta() {
  return (
    <section aria-labelledby="closing-cta-heading" className="bg-cream-100 py-12 sm:py-14 lg:py-16">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <LogoMark className="mx-auto size-16 text-saffron-600" />
        <h2 id="closing-cta-heading" className="mt-5 text-2xl leading-[1.375] font-normal text-balance text-plum-800 sm:text-3xl">
          გსურს ტრანსცენდენტული მედიტაციის სწავლა?
        </h2>
        <p className="mx-auto mt-4 max-w-xl text-base leading-7 text-plum-500 sm:text-[17px]">
          გაეცანი ტრანსცენდენტულ მედიტაციას, შეიტყვე სწავლების პროცესის შესახებ და აირჩიე შენთვის მოსახერხებელი დრო.
        </p>
        <div className="mx-auto mt-6 flex max-w-xs flex-col justify-center gap-3 sm:max-w-none sm:flex-row sm:gap-4">
          <Link
            href={'/blog/ra-aris-transtsendentuli-meditatsia' as Route}
            className="inline-flex min-h-14 items-center justify-center gap-2 rounded-full bg-saffron-400 px-7 py-4 text-[15px] font-medium text-plum-900 transition-colors hover:bg-saffron-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-800"
          >
            გაეცანი TM-ს
            <ArrowRight aria-hidden="true" className="size-4" />
          </Link>
          <Link
            href={'/#contact' as Route}
            className="inline-flex min-h-14 items-center justify-center rounded-full bg-mist-300 px-7 py-4 text-[15px] text-plum-800 transition-colors hover:bg-mist-400 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-800"
          >
            სწავლებაზე ჩაწერა
          </Link>
        </div>
      </div>
    </section>
  );
}
