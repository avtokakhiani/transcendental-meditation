'use client';

import { useActionState } from 'react';
import { changePrivacyRecord, runPrivacyCleanup, searchPrivacyRecords, type PrivateRecordView } from './actions';

const inputStyle = 'mt-2 block w-full rounded-lg border border-plum-300 bg-cream-50 p-3 text-base';
const buttonStyle = 'rounded-full bg-mist-300 px-5 py-3 text-sm disabled:opacity-50';
const confirmation = 'მოთხოვნა და ვინაობა გადამოწმებულია; ოპერაცია უფლებამოსილია.';

export function PrivacyControls() {
  const [search, action, pending] = useActionState(searchPrivacyRecords, {});
  const [cleanup, cleanupAction, cleaning] = useActionState(runPrivacyCleanup, {});
  return <div className="space-y-8">
    <form action={action} className="rounded-xl border border-cream-300 bg-cream-50 p-6">
      <label>ჩანაწერების ძებნა ელფოსტით<input name="email" type="email" required className={inputStyle} /></label>
      <button disabled={pending} className={`${buttonStyle} mt-4`}>{pending ? 'ძებნა…' : 'ძებნა'}</button>
      {search.error && <p role="alert" className="mt-4 text-red-800">{search.error}</p>}
    </form>
    {search.records?.length === 0 && <p role="status">ჩანაწერები არ მოიძებნა.</p>}
    {search.records?.map(record => <RecordControls key={`${record.scope}-${record.id}`} record={record} />)}
    <form action={cleanupAction} className="rounded-xl border border-cream-300 p-6">
      <p className="mb-4">ავტომატური ვადები: რეგისტრაცია — შეხვედრიდან 12 თვე; ორგანიზაციის მოთხოვნა — ბოლო კომუნიკაციიდან 12 თვე; აუდიტი — 90 დღე; ადგილობრივი სარეზერვო ასლები — 30 დღე.</p>
      <label className="flex items-start gap-3 text-sm"><input type="checkbox" name="confirmed" value="yes" required />ვადაგასული ჩანაწერების წაშლას ვადასტურებ.</label>
      <button disabled={cleaning} className={`${buttonStyle} mt-4`}>შენახვის ვადების შემოწმება</button>
      {(cleanup.message || cleanup.error) && <p role="status" className="mt-4">{cleanup.message || cleanup.error}</p>}
    </form>
  </div>;
}

function RecordControls({ record }: { record: PrivateRecordView }) {
  const [state, action, pending] = useActionState(changePrivacyRecord, {});
  if (state.removed) return <p role="status" className="rounded-xl bg-cream-200 p-6">{state.message}</p>;
  return <section id={`${record.scope}-${record.id}`} className="rounded-xl border border-cream-300 bg-cream-50 p-6">
    <h2 className="text-lg">{record.scope === 'registration' ? 'რეგისტრაცია' : 'ორგანიზაციის მოთხოვნა'}</h2>
    <p className="my-3 text-sm">შენახვის ბოლო ვადა: {record.expiresAt}; დამუშავება: {record.restricted ? 'შეზღუდული' : 'აქტიური'}; გამონაკლისი: {record.holdUntil || 'არა'}</p>
    <form action={action} className="grid gap-4">
      <input type="hidden" name="scope" value={record.scope} /><input type="hidden" name="id" value={record.id} />
      {Object.entries(record.values).map(([name, value]) => <label key={name} className="text-sm">{name}
        {name === 'message' ? <textarea name={name} defaultValue={value} maxLength={5000} className={inputStyle} /> : <input name={name} defaultValue={value} readOnly={['createdAt', 'lastBusinessContactAt', 'meetingId'].includes(name)} className={inputStyle} />}
      </label>)}
      <label className="text-sm">შენახვის გამონაკლისის დასრულება (თბილისი)<input name="holdUntil" type="datetime-local" className={inputStyle} /></label>
      <label className="text-sm">გამონაკლისის მიზეზი<select name="holdReason" defaultValue="" className={inputStyle}><option value="">აირჩიე დასაბუთებული მიზეზი</option><option value="legal_obligation">სამართლებრივი ვალდებულება</option><option value="security_incident">უსაფრთხოების ინციდენტი</option></select></label>
      <label className="flex items-start gap-3 text-sm"><input name="confirmed" type="checkbox" value="yes" required />{confirmation}</label>
      <div className="flex flex-wrap gap-3">{([
        ['update', 'შესწორება'], ['export', 'ასლის მომზადება'], ['restrict', 'დამუშავების შეზღუდვა'], ['unrestrict', 'შეზღუდვის მოხსნა'],
        ['hold', 'გამონაკლისის აღრიცხვა'], ['release_hold', 'გამონაკლისის მოხსნა'], ['notify', 'შეტყობინების ხელახალი მცდელობა'],
        ...(record.scope === 'corporate' ? [['mark_contact', 'დღევანდელი კომუნიკაციის აღრიცხვა']] : []), ['delete', 'ჩანაწერის წაშლა'],
      ]).map(([operation, label]) => <button key={operation} type="submit" name="operation" value={operation} disabled={pending} className={buttonStyle}>{label}</button>)}</div>
      {(state.error || state.message) && <p role="status">{state.error || state.message}</p>}
      {state.exportData && <label className="text-sm">კონფიდენციალური ასლი — მიაწოდე მხოლოდ გადამოწმებულ პირს<textarea readOnly value={state.exportData} rows={10} className={inputStyle} /></label>}
    </form>
  </section>;
}
