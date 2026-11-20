'use client';

import { useRef, useState, type FormEvent } from 'react';
import { LoaderCircle } from 'lucide-react';
import { corporate } from '@/content/corporate';
import { corporateContactMethods, corporateDeliveryError } from '@/lib/corporate-inquiry';
import styles from './corporate.module.css';

export function CorporateForm() {
  const [contactMethod, setContactMethod] = useState<string>(corporateContactMethods[0]);
  const [status, setStatus] = useState<'idle' | 'pending' | 'success' | 'error'>('idle');
  const [error, setError] = useState('');
  const sending = useRef(false);
  const startedAt = useRef<number | null>(null);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (sending.current) return;
    sending.current = true;
    setStatus('pending');
    setError('');
    const data = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const response = await fetch('/api/corporate-inquiries', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...data, startedAt: startedAt.current ?? Date.now() }),
        signal: AbortSignal.timeout(25_000),
      });
      const result = await response.json();
      if (!response.ok || result.ok !== true) throw new Error(result.error || corporateDeliveryError);
      setStatus('success');
    } catch (cause) {
      setError(cause instanceof Error && cause.name === 'Error' ? cause.message : corporateDeliveryError);
      setStatus('error');
    } finally {
      sending.current = false;
    }
  }

  if (status === 'success') return <div role="status" className={styles.success}>{corporate.form.success}</div>;

  return (
    <form className={styles.form} onSubmit={submit} onFocusCapture={() => { startedAt.current ??= Date.now(); }} aria-label={corporate.form.heading} aria-busy={status === 'pending'}>
      <div className={styles.trap} aria-hidden="true">
        <label htmlFor="corporate-website">Website</label>
        <input id="corporate-website" name="website" tabIndex={-1} autoComplete="off" />
      </div>
      <fieldset disabled={status === 'pending'} className={styles.fields}>
        <label className={styles.field} htmlFor="corporate-name">
          <span>სახელი და გვარი <span aria-hidden="true">*</span></span>
          <input id="corporate-name" name="name" autoComplete="name" required maxLength={150} />
        </label>
        <label className={styles.field} htmlFor="corporate-organization">
          <span>ორგანიზაცია <span aria-hidden="true">*</span></span>
          <input id="corporate-organization" name="organization" autoComplete="organization" required maxLength={200} />
        </label>
        <label className={styles.field} htmlFor="corporate-email">
          <span>ელფოსტა <span aria-hidden="true">*</span></span>
          <input id="corporate-email" name="email" type="email" autoComplete="email" required maxLength={254} />
        </label>
        <label className={styles.field} htmlFor="corporate-phone">
          <span>ტელეფონის ნომერი {contactMethod === 'ტელეფონით' && <span aria-hidden="true">*</span>}</span>
          <input id="corporate-phone" name="phone" type="tel" autoComplete="tel" required={contactMethod === 'ტელეფონით'} pattern={'[+0-9\\s.\\(\\)\\-]{5,40}'} maxLength={40} />
        </label>
        <label className={`${styles.field} ${styles.wide}`} htmlFor="corporate-method">
          <span>დაკავშირების სასურველი ფორმა</span>
          <select id="corporate-method" name="contactMethod" value={contactMethod} onChange={event => setContactMethod(event.target.value)}>{corporateContactMethods.map(value => <option key={value}>{value}</option>)}</select>
        </label>
        <label className={`${styles.field} ${styles.wide}`} htmlFor="corporate-message">
          <span>დამატებითი ინფორმაცია</span>
          <textarea id="corporate-message" name="message" rows={4} maxLength={5000} />
        </label>
      </fieldset>
      <p className={styles.privacy}>{corporate.form.privacy}</p>
      {status === 'error' && <p role="alert" id="corporate-error" className={styles.error}>{error}</p>}
      <button className={styles.button} type="submit" disabled={status === 'pending'} aria-describedby={status === 'error' ? 'corporate-error' : undefined}>
        {status === 'pending' && <LoaderCircle aria-hidden="true" className="mr-2 size-5 animate-spin motion-reduce:animate-none" />}
        {corporate.form.submit}
      </button>
    </form>
  );
}
