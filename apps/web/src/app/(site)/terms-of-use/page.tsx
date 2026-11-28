import type { Metadata } from 'next';
import { TermsContent } from '@/components/privacy/terms-content';

export const metadata: Metadata = { title: 'გამოყენების პირობები', robots: { index: false, follow: false } };

export default function TermsOfUsePage() {
  return <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
    <p className="mb-6 text-sm text-plum-500">გაშვებამდე ვერსია</p>
    <TermsContent titleId="terms-of-use-heading" />
  </section>;
}
