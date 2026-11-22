'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { X } from 'lucide-react';
import { INTRODUCTORY_MEETING_ROUTE } from '@/lib/routes';
import { lockBodyScroll } from '@/lib/body-scroll-lock';
import { MeetingRegistration } from './meeting-registration';
import styles from './meetings.module.css';
import { TEMPORARY_MEETING_PREVIEW_ENABLED, temporaryTestMeetings } from './temporary-test-meetings';

/** One site-wide enhancement of meeting links; their href remains a working fallback. */
export function MeetingPanel() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const dialog = useRef<HTMLDialogElement>(null);
  const trigger = useRef<HTMLElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const onClick = (event: MouseEvent) => {
      if (event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) return;
      const link = event.target instanceof Element ? event.target.closest('a') : null;
      if (!link || link.hasAttribute('download') || (link.target && link.target !== '_self')) return;
      const url = new URL(link.href, window.location.href);
      if (url.origin !== window.location.origin || url.pathname.replace(/\/$/, '') !== INTRODUCTORY_MEETING_ROUTE) return;
      event.preventDefault();
      // Let link handlers run (e.g. closing mobile navigation). preventDefault
      // also tells Next Link to leave the current route unchanged.
      const returnFocusId = link.getAttribute('data-dialog-return-focus');
      trigger.current = (returnFocusId ? document.getElementById(returnFocusId) : null) ?? link;
      setOpen(true);
    };
    document.addEventListener('click', onClick, true);
    return () => document.removeEventListener('click', onClick, true);
  }, []);

  useEffect(() => { setOpen(false); }, [pathname]);
  useEffect(() => {
    if (!open) return;
    const element = dialog.current;
    if (!element) return;
    const unlockScroll = lockBodyScroll();
    element.showModal();
    return () => {
      element.close();
      unlockScroll();
      if (trigger.current?.isConnected) trigger.current.focus({ preventScroll: true });
    };
  }, [open]);

  return <dialog ref={dialog} className={styles.panel} aria-labelledby={titleId}
    onKeyDown={event => {
      if (event.key !== 'Tab') return;
      const items = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled):not([type="hidden"]), a[href], [tabindex="0"]'))
        .filter(element => element.tabIndex >= 0 && element.getClientRects().length > 0);
      const first = items[0];
      const last = items.at(-1);
      if (!first || !last) { event.preventDefault(); return; }
      if (event.shiftKey && (document.activeElement === first || !items.includes(document.activeElement as HTMLElement))) {
        event.preventDefault(); last.focus();
      } else if (!event.shiftKey && (document.activeElement === last || !items.includes(document.activeElement as HTMLElement))) {
        event.preventDefault(); first.focus();
      }
    }}
    onCancel={event => { event.preventDefault(); setOpen(false); }}
    onClick={event => {
      if (event.target !== event.currentTarget) return;
      const box = event.currentTarget.getBoundingClientRect();
      if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) setOpen(false);
    }}>
    {open && <>
      <button type="button" autoFocus className={styles.close} aria-label="პანელის დახურვა" onClick={() => setOpen(false)}><X aria-hidden="true" size={22} /></button>
      <MeetingRegistration titleId={titleId} previewMeetings={TEMPORARY_MEETING_PREVIEW_ENABLED ? temporaryTestMeetings : undefined} />
    </>}
  </dialog>;
}
