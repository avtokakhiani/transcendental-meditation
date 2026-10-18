import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

/**
 * Raw HTML in the source is escaped (react-markdown's default), so editor content can never
 * inject scripts. Images are lazy so long book pages stay cheap.
 */
export function Markdown({ source, className = '' }: { source: string; className?: string }) {
  return (
    <div className={`prose prose-tm max-w-none ${className}`}>
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        components={{
          img: ({ src, alt }) => <img src={typeof src === 'string' ? src : undefined} alt={alt ?? ''} loading="lazy" />,
          a: ({ href, children }) => {
            const external = href !== undefined && /^https?:\/\//.test(href);
            return (
              <a href={href} {...(external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}>
                {children}
              </a>
            );
          },
        }}
      >
        {source}
      </ReactMarkdown>
    </div>
  );
}
