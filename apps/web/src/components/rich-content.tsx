import type { ContentFormat } from '@tm/shared';
import { sanitizeRichHtml } from '@/server/sanitize';
import { Markdown } from './markdown';

/** Renders stored content in whichever format it was saved in. */
export function RichContent({
  content,
  format,
  className = '',
}: {
  content: string;
  format: ContentFormat | string;
  className?: string;
}) {
  if (format === 'html') {
    return (
      <div
        className={`prose prose-tm rich-content max-w-none ${className}`}
        dangerouslySetInnerHTML={{ __html: sanitizeRichHtml(content) }}
      />
    );
  }
  return <Markdown source={content} className={className} />;
}
