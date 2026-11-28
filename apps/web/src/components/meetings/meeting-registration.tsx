'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { ChevronDown, MapPin, Video } from 'lucide-react';
import { formatCompactMeetingDate, registrationError, registrationSchema, type PublicMeeting } from '@/lib/meetings';
import { noUpcomingMeetingsNotice, publicMeetingRegistrationEnabled } from '@/lib/meeting-registration-policy';
import styles from './meetings.module.css';

export function MeetingRegistration({ titleId, standalone = false }: { titleId: string; standalone?: boolean }) {
  const registrationEnabled = publicMeetingRegistrationEnabled();
  const [meetings, setMeetings] = useState<PublicMeeting[]>([]);
  const [loading, setLoading] = useState(registrationEnabled);
  const [error, setError] = useState('');
  const [selected, setSelected] = useState<string | null>(null);
  const [version, setVersion] = useState(0);
  const id = useId();

  useEffect(() => {
    if (!registrationEnabled) {
      setLoading(false);
      return;
    }
    const controller = new AbortController();
    let initial = true;
    const load = async () => {
      try {
        const response = await fetch('/api/meetings', { cache: 'no-store', signal: controller.signal });
        if (!response.ok) throw new Error();
        const data = await response.json();
        if (!controller.signal.aborted) { setMeetings(data.meetings); setError(''); }
      } catch {
        if (!controller.signal.aborted && initial) setError('შეხვედრების ჩატვირთვა ვერ მოხერხდა. გთხოვ, სცადო ხელახლა.');
      } finally { if (!controller.signal.aborted) setLoading(false); initial = false; }
    };
    void load();
    const timer = window.setInterval(() => void load(), 60000);
    return () => { controller.abort(); window.clearInterval(timer); };
  }, [version, registrationEnabled]);

  const upcoming = registrationEnabled ? meetings.filter(meeting => new Date(meeting.startsAt).getTime() > Date.now())
    .sort((a, b) => a.startsAt.localeCompare(b.startsAt)) : [];
  const Heading = standalone ? 'h1' : 'h2';
  return (
    <div className={styles.content}>
      <Heading id={titleId} className={styles.title}>გაცნობითი შეხვედრები</Heading>
      <p className={styles.subtitle}>აირჩიე სასურველი შეხვედრა და დარეგისტრირდი.</p>
      {registrationEnabled && loading ? <p role="status" className={styles.notice}>შეხვედრები იტვირთება…</p> : registrationEnabled && error ? (
        <div className={styles.notice}><p role="alert">{error}</p><button type="button" className={styles.retry} onClick={() => { setLoading(true); setVersion(value => value + 1); }}>სცადე ხელახლა</button></div>
      ) : upcoming.length === 0 ? (
        <p role="status" className={styles.notice}>{noUpcomingMeetingsNotice}</p>
      ) : <ul className={styles.list}>{upcoming.map(meeting => {
        const expanded = selected === meeting.id;
        const formId = `${id}-${meeting.id}`;
        return <li key={meeting.id} className={styles.meeting} data-expanded={expanded}>
          <button type="button" className={styles.meetingButton} aria-expanded={expanded} aria-controls={expanded ? formId : undefined}
            disabled={meeting.availability !== 'open'} onClick={() => setSelected(expanded ? null : meeting.id)}>
            <span className={styles.meetingDetails}>
              <span className={styles.meetingMeta}>
                <time dateTime={meeting.startsAt} className={styles.date}>{formatCompactMeetingDate(meeting.startsAt)}</time>
                <span className={`${styles.format} ${meeting.format === 'online' ? styles.online : styles.inPerson}`}>{meeting.format === 'online' ? <Video size={14} aria-hidden="true" /> : <MapPin size={14} aria-hidden="true" />}{meeting.format === 'online' ? 'ონლაინ' : 'პირისპირ'}</span>
              </span>
              {meeting.teacher && <span className={styles.teacher}>{meeting.teacher}</span>}
              {meeting.format === 'in_person' && <span className={styles.location}>{meeting.location}</span>}
              {(meeting.availability !== 'open' || meeting.remaining !== null) && <span className={styles.availability}>{meeting.availability === 'closed' ? 'რეგისტრაცია დახურულია' : meeting.availability === 'full' ? 'ყველა ადგილი დაკავებულია' : `დარჩენილია ${meeting.remaining} ადგილი`}</span>}
            </span>
            {meeting.availability === 'open' && <ChevronDown aria-hidden="true" size={20} className={expanded ? styles.rotated : undefined} />}
          </button>
          {expanded && <div id={formId} className={styles.expansion}>
            <RegistrationForm meetingId={meeting.id} available={meeting.availability === 'open'} onRegistered={() => setVersion(value => value + 1)} />
          </div>}
        </li>;
      })}</ul>}
    </div>
  );
}

function RegistrationForm({ meetingId, available, onRegistered }: { meetingId: string; available: boolean; onRegistered: () => void }) {
  const [pending, setPending] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const sending = useRef(false);
  const id = useId();
  const feedback = useRef<HTMLParagraphElement>(null);
  useEffect(() => { if (success || error) feedback.current?.focus(); }, [success, error]);

  if (success) return <p ref={feedback} tabIndex={-1} role="status" className={styles.success}>რეგისტრაცია წარმატებით დასრულდა. გელოდებით შეხვედრაზე!</p>;
  return <form aria-label="შეხვედრაზე რეგისტრაცია" aria-busy={pending} onSubmit={async event => {
    event.preventDefault();
    if (sending.current || !available || !publicMeetingRegistrationEnabled()) return;
    const form = event.currentTarget;
    const data = Object.fromEntries(new FormData(form));
    const parsed = registrationSchema.safeParse({ ...data, meetingId });
    if (!parsed.success) {
      const errors: Record<string, string> = {};
      for (const issue of parsed.error.issues) errors[String(issue.path[0])] = issue.message;
      setFieldErrors(errors);
      const first = form.elements.namedItem(Object.keys(errors)[0] || '');
      if (first instanceof HTMLElement) first.focus();
      return;
    }
    sending.current = true; setPending(true); setError(''); setFieldErrors({});
    try {
      const response = await fetch('/api/meetings/register', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(parsed.data) });
      const result = await response.json();
      if (!response.ok || result.ok !== true) {
        setError(result.error || registrationError);
        if (response.status === 409) onRegistered();
      } else { setSuccess(true); onRegistered(); }
    } catch { setError(registrationError); }
    finally { sending.current = false; setPending(false); }
  }}>
    <p className={styles.formTitle}>შეხვედრაზე რეგისტრაცია</p>
    <div className={styles.fields}>
      {([
        ['firstName', 'სახელი', 'text', 'given-name', 100],
        ['lastName', 'გვარი', 'text', 'family-name', 100],
        ['email', 'ელფოსტა', 'email', 'email', 254],
        ['phone', 'ტელეფონის ნომერი', 'tel', 'tel', 40],
      ] as const).map(([name, label, type, autoComplete, maxLength]) => <div key={name} className={name === 'email' || name === 'phone' ? styles.fullField : undefined}>
        <label className={styles.label} htmlFor={`${id}-${name}`}>{label} <span aria-hidden="true">*</span></label>
        <input className={styles.input} id={`${id}-${name}`} name={name} type={type} autoComplete={autoComplete} maxLength={maxLength}
          required disabled={pending} aria-invalid={Boolean(fieldErrors[name])} aria-describedby={fieldErrors[name] ? `${id}-${name}-error` : undefined} />
        {fieldErrors[name] && <p id={`${id}-${name}-error`} className={styles.error}>{fieldErrors[name]}</p>}
      </div>)}
    </div>
    <div hidden aria-hidden="true"><label>Website<input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <p className={styles.privacy}>შეყვანილი მონაცემები გამოიყენება შეხვედრაზე რეგისტრაციისა და შენთან დაკავშირებისთვის.</p>
    <p className={styles.privacy}><a href="/privacy-policy" className="underline underline-offset-4">კონფიდენციალურობის პოლიტიკა</a></p>
    {error && <p ref={feedback} tabIndex={-1} role="alert" className={styles.error}>{error}</p>}
    {!available && <p role="status" className={styles.error}>ამ შეხვედრაზე რეგისტრაცია აღარ არის ხელმისაწვდომი.</p>}
    <button className={styles.submit} type="submit" disabled={pending || !available}>{pending ? 'იგზავნება…' : 'რეგისტრაცია'}</button>
  </form>;
}
