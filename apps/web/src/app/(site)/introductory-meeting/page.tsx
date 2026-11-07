import type { Metadata } from 'next';

export const metadata: Metadata = { title: 'გაცნობითი შეხვედრა' };

export default function IntroductoryMeetingPage() {
  return (
    <section aria-labelledby="meeting-heading" className="mx-auto max-w-4xl px-5 py-20 sm:px-6 sm:py-28 lg:px-10">
      <h1 id="meeting-heading" className="text-3xl font-normal leading-relaxed text-plum-800 sm:text-4xl">გაცნობითი შეხვედრა</h1>
      <p className="mt-6 text-base leading-8 text-plum-700">გაცნობით შეხვედრაზე რეგისტრაცია მალე დაემატება.</p>
    </section>
  );
}
