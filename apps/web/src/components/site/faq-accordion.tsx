import { Plus } from 'lucide-react';
import type { FaqItem } from '@/content/faq';

export function FaqAccordion({ items }: { items: readonly FaqItem[] }) {
  return (
    <div className="border-t border-cream-300">
      {items.map((item) => (
        // Native disclosure controls support keyboard and screen readers without JS.
        // No shared name: readers can keep multiple answers expanded at once.
        <details key={item.id} className="group border-b border-cream-300">
          <summary className="flex cursor-pointer list-none items-center justify-between gap-6 rounded-sm py-6 text-base leading-7 text-plum-800 transition hover:text-plum-500 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-plum-700 sm:py-8 sm:text-lg [&::-webkit-details-marker]:hidden">
            <span>{item.question}</span>
            <Plus aria-hidden="true" className="size-5 shrink-0 transition-transform group-open:rotate-45 motion-reduce:transition-none" strokeWidth={1.5} />
          </summary>
          <div className="max-w-3xl whitespace-pre-line pb-7 pr-10 text-base leading-8 text-plum-500 sm:pb-8">
            {item.answer}
          </div>
        </details>
      ))}
    </div>
  );
}
