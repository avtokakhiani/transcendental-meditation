import { termsOfUseMarkdown } from '@/content/terms-of-use';
import { LegalContent } from './privacy-content';

export function TermsContent({ titleId }: { titleId: string }) {
  return <LegalContent titleId={titleId} markdown={termsOfUseMarkdown} />;
}
