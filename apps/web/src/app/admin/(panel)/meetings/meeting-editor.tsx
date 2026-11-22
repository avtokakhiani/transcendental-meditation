'use client';

import { useActionState } from 'react';
import { saveMeeting } from './actions';

export interface EditableMeeting {
  id: string; startsAt: string; format: string; location: string | null;
  joiningInstructions: string | null; status: string; capacity: number | null;
  registrationClosesAt: string;
}

export function MeetingEditor({ meeting }: { meeting?: EditableMeeting }) {
  const [state, action, pending] = useActionState(saveMeeting, {});
  const inputClass = 'mt-2 block w-full rounded-lg border border-plum-300 bg-cream-50 px-3 py-2 text-base';
  return <form action={action} className="grid gap-5 text-sm text-plum-800 sm:grid-cols-2">
    <input type="hidden" name="id" value={meeting?.id || ''} />
    <label>თარიღი და დრო (თბილისი)<input type="datetime-local" name="startsAt" required defaultValue={meeting?.startsAt} className={inputClass} /></label>
    <label>რეგისტრაციის დასრულება (თბილისი)<input type="datetime-local" name="registrationClosesAt" defaultValue={meeting?.registrationClosesAt} className={inputClass} /></label>
    <label>ფორმატი<select name="format" defaultValue={meeting?.format || 'online'} className={inputClass}><option value="online">ონლაინ</option><option value="in_person">პირისპირ</option></select></label>
    <label>სტატუსი<select name="status" defaultValue={meeting?.status || 'draft'} className={inputClass}><option value="draft">მონახაზი</option><option value="open">რეგისტრაცია ღიაა</option><option value="closed">რეგისტრაცია დახურულია</option></select></label>
    <label>მდებარეობა<input name="location" maxLength={500} defaultValue={meeting?.location || ''} className={inputClass} /></label>
    <label>ადგილების რაოდენობა (ცარიელი = შეუზღუდავი)<input type="number" name="capacity" min={1} max={1000000} defaultValue={meeting?.capacity ?? ''} className={inputClass} /></label>
    <label className="sm:col-span-2">მონაწილესთან გასაგზავნი ინსტრუქცია / ონლაინ ბმული<textarea name="joiningInstructions" maxLength={2000} defaultValue={meeting?.joiningInstructions || ''} className={inputClass} /></label>
    <div className="sm:col-span-2">
      {state.error && <p role="alert" className="mb-3 text-red-800">{state.error}</p>}
      {state.success && <p role="status" className="mb-3">{state.success}</p>}
      <button type="submit" disabled={pending} className="rounded-full bg-mist-300 px-6 py-3 disabled:opacity-60">{pending ? 'ინახება…' : 'შენახვა'}</button>
    </div>
  </form>;
}
