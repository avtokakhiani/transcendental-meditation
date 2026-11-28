import ReactMarkdown, { defaultUrlTransform } from 'react-markdown';
import { privacyPolicyMarkdown } from '@/content/privacy-policy';
import styles from './privacy.module.css';

export function PrivacyContent({ titleId }: { titleId: string }) {
  return <LegalContent titleId={titleId} markdown={privacyPolicyMarkdown} />;
}

export function LegalContent({ titleId, markdown }: { titleId: string; markdown: string }) {
  return <article className={styles.policy}>
    <ReactMarkdown
      urlTransform={(url, key) => key === 'href' && /^tel:\+?\d+$/.test(url) ? url : defaultUrlTransform(url)}
      components={{ h1: ({ children }) => <h1 id={titleId}>{children}</h1> }}
    >{markdown}</ReactMarkdown>
  </article>;
}
