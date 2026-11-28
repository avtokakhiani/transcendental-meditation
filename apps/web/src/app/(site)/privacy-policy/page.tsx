import type { Metadata } from 'next';
import { PrivacyContent } from '@/components/privacy/privacy-content';

export const metadata: Metadata = { title: 'კონფიდენციალურობის პოლიტიკა', robots: { index: false, follow: false } };

export default function PrivacyPolicyPage() {
  return <section className="mx-auto max-w-4xl px-5 py-16 sm:px-8">
    <p className="mb-6 text-sm text-plum-500">გაშვებამდე ვერსია</p>
    <PrivacyContent titleId="privacy-policy-heading" />
  </section>;
}
