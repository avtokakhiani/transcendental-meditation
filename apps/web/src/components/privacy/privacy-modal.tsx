'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { PrivacyContent } from './privacy-content';
import { TermsContent } from './terms-content';
import { lockBodyScroll } from '@/lib/body-scroll-lock';
import styles from './privacy.module.css';

function LegalDocumentModal({ documentType }: { documentType: 'privacy' | 'terms' }) {
  const isPrivacy = documentType === 'privacy';
  const route = isPrivacy ? '/privacy-policy' : '/terms-of-use';
  const closeLabel = isPrivacy ? 'კონფიდენციალურობის პოლიტიკის დახურვა' : 'გამოყენების პირობების დახურვა';
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const titleId = useId();
  useEffect(() => {
    const click = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
      const link = event.target instanceof Element ? event.target.closest('a[href]') : null;
      if (!(link instanceof HTMLAnchorElement) || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      const url = new URL(link.href);
      if (url.origin !== location.origin || url.pathname.replace(/\/$/, '') !== route) return;
      event.preventDefault(); event.stopPropagation(); trigger.current = link; setOpen(true);
    };
    document.addEventListener('click', click, true);
    return () => document.removeEventListener('click', click, true);
  }, [route]);
  useEffect(() => {
    if (!open || !dialog.current) return;
    const element = dialog.current;
    const unlockScroll = lockBodyScroll();
    element.showModal();
    return () => {
      element.close(); unlockScroll();
      if (trigger.current?.isConnected) trigger.current.focus({ preventScroll: true });
    };
  }, [open]);
  return <dialog ref={dialog} className={styles.modal} aria-labelledby={titleId} data-legal-document={documentType}
    onCancel={event => { event.preventDefault(); setOpen(false); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const box = event.currentTarget.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) setOpen(false);
    }}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button, a[href]')).filter(element => element.getClientRects().length > 0);
      const first = items[0], last = items.at(-1);
      if (event.shiftKey && (document.activeElement === first || !items.includes(document.activeElement as HTMLElement))) { event.preventDefault(); last?.focus(); }
      else if (!event.shiftKey && (document.activeElement === last || !items.includes(document.activeElement as HTMLElement))) { event.preventDefault(); first?.focus(); }
    }}>
    {open && <>
      <div className={styles.toolbar}><span>გაშვებამდე ვერსია</span><button type="button" autoFocus aria-label={closeLabel} onClick={() => setOpen(false)}><X size={22} aria-hidden="true" /></button></div>
      <div className={styles.scroll}>{isPrivacy ? <PrivacyContent titleId={titleId} /> : <TermsContent titleId={titleId} />}</div>
    </>}
  </dialog>;
}

export function PrivacyModal() {
  return <LegalDocumentModal documentType="privacy" />;
}

export function TermsModal() {
  return <LegalDocumentModal documentType="terms" />;
}
