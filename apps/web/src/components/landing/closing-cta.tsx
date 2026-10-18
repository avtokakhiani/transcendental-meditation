import { ArrowRight } from 'lucide-react';
import { LogoMark } from '@/components/site/logo';
import { SITE } from '@/lib/site';

export function ClosingCta() {
  return (
    <section className="bg-cream-100 py-24">
      <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
        <LogoMark className="mx-auto size-16 text-saffron-600" />
        <h2 className="mt-8 text-3xl leading-tight font-light text-plum-800 sm:text-[2.6rem]">
          სიმშვიდე უკვე <em className="font-serif font-normal italic">შენშია</em>.
          <br className="hidden sm:block" /> ჩვენ მხოლოდ გზას გაჩვენებთ.
        </h2>
        <p className="mx-auto mt-6 max-w-xl text-[15px] leading-7 text-plum-500">
          დაგვიკავშირდით და შეგახვედრებთ სერტიფიცირებულ მასწავლებელს თქვენს ქალაქში. პირველი
          გაცნობითი შეხვედრა უფასოა.
        </p>
        <a
          href={SITE.phoneHref}
          className="mt-10 inline-flex items-center gap-2 rounded-full bg-saffron-400 px-8 py-4 text-[15px] font-medium text-plum-900 transition hover:bg-saffron-500"
        >
          დაგვირეკეთ: {SITE.phone}
          <ArrowRight aria-hidden="true" className="size-4" />
        </a>
      </div>
    </section>
  );
}
