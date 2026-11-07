import type { Metadata } from 'next';
import { FaqAccordion } from '@/components/site/faq-accordion';
import { InternalPageHero } from '@/components/site/internal-page-hero';
import { faqItems } from '@/content/faq';

export const metadata: Metadata = { title: 'ხშირად დასმული კითხვები' };

export default function FaqPage() {
  return (
    <div className="bg-cream-100">
      <InternalPageHero title="ხშირად დასმული კითხვები" headingId="faq-heading" />
      <section aria-labelledby="questions-heading" className="mx-auto max-w-4xl px-5 py-16 sm:px-6 sm:py-20 lg:px-10 lg:py-28">
        <h2 id="questions-heading" className="text-2xl font-normal leading-snug sm:text-3xl">კითხვები და პასუხები</h2>
        <p className="mb-10 mt-5 text-base leading-8 text-plum-500">[შესავსები სექცია — კითხვები და პასუხები მოგვიანებით დაემატება.]</p>
        <FaqAccordion items={faqItems} />
      </section>
    </div>
  );
}
