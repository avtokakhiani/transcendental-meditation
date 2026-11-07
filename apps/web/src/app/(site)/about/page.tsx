import type { Metadata } from 'next';
import { UserRound } from 'lucide-react';
import { InternalPageHero } from '@/components/site/internal-page-hero';

export const metadata: Metadata = { title: 'ჩვენ შესახებ' };

// Replace these two slots with the teachers' supplied names, biographies, and photos.
const teacherSlots = ['01', '02'] as const;

export default function AboutPage() {
  return (
    <div className="bg-cream-100">
      <InternalPageHero title="ჩვენ შესახებ" headingId="about-heading" />

      <div className="mx-auto max-w-6xl px-5 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-28">
        <div className="grid gap-14 border-b border-cream-300 pb-16 sm:gap-16 sm:pb-20 lg:grid-cols-2 lg:gap-24">
          <section aria-labelledby="introduction-heading">
            <p className="mb-4 text-xs tracking-widest text-plum-500">შესავსები სექცია · 01</p>
            <h2 id="introduction-heading" className="text-2xl font-normal leading-snug sm:text-3xl">შესავალი</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-plum-500">[შესავალი ტექსტის ადგილი — ინფორმაცია მოგვიანებით დაემატება.]</p>
          </section>
          <section aria-labelledby="mission-heading">
            <p className="mb-4 text-xs tracking-widest text-plum-500">შესავსები სექცია · 02</p>
            <h2 id="mission-heading" className="text-2xl font-normal leading-snug sm:text-3xl">ჩვენი მისია</h2>
            <p className="mt-6 max-w-xl text-base leading-8 text-plum-500">[ჩვენი მისიის ტექსტის ადგილი — ინფორმაცია მოგვიანებით დაემატება.]</p>
          </section>
        </div>

        <section aria-labelledby="teachers-heading" className="pt-16 sm:pt-20">
          <p className="mb-4 text-xs tracking-widest text-plum-500">შესავსები სექცია · 03</p>
          <h2 id="teachers-heading" className="text-2xl font-normal leading-snug sm:text-3xl">TM-ის მასწავლებლები</h2>
          <div className="mt-10 grid gap-12 sm:grid-cols-2 sm:gap-8 lg:gap-14">
            {teacherSlots.map((slot) => (
              <article key={slot} aria-labelledby={`teacher-${slot}`}>
                <div className="flex aspect-[4/5] flex-col items-center justify-center gap-4 rounded-2xl border border-dashed border-cream-300 bg-cream-200 px-6 text-center text-plum-500">
                  <UserRound aria-hidden="true" className="size-12" strokeWidth={1} />
                  <p className="text-sm leading-7">[მასწავლებლის ფოტოს ადგილი · {slot}]</p>
                </div>
                <h3 id={`teacher-${slot}`} className="mt-6 text-xl font-normal leading-relaxed">[მასწავლებლის სახელი · {slot}]</h3>
                <p className="mt-3 text-base leading-8 text-plum-500">[მასწავლებლის ბიოგრაფიის ადგილი — ტექსტი მოგვიანებით დაემატება.]</p>
              </article>
            ))}
          </div>
        </section>
      </div>
    </div>
  );
}
