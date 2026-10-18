'use client';

import { Eye, EyeOff, LoaderCircle } from 'lucide-react';
import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import { inputClass, labelClass, primaryButton } from './ui';

export function LoginFormFields({ hasError }: { hasError: boolean }) {
  const { pending } = useFormStatus();
  const [visible, setVisible] = useState(false);

  return (
    <fieldset disabled={pending} aria-busy={pending} className="space-y-5">
      <label className={labelClass}>
        მომხმარებელი
        <input name="username" required autoComplete="username" autoFocus className={inputClass} />
      </label>
      <div>
        <label htmlFor="password" className={labelClass}>პაროლი</label>
        <div className="relative">
          <input
            id="password"
            name="password"
            type={visible ? 'text' : 'password'}
            required
            autoComplete="current-password"
            className={`${inputClass} pr-11`}
          />
          <button
            type="button"
            aria-label={visible ? 'პაროლის დამალვა' : 'პაროლის ჩვენება'}
            aria-pressed={visible}
            onClick={() => setVisible((value) => !value)}
            className="absolute inset-y-0 right-0 mt-1.5 grid w-11 place-items-center text-plum-400 hover:text-plum-700"
          >
            {visible ? <EyeOff aria-hidden="true" size={18} /> : <Eye aria-hidden="true" size={18} />}
          </button>
        </div>
      </div>
      {hasError ? <p className="text-sm text-rose-600">მომხმარებელი ან პაროლი არასწორია</p> : null}
      <button type="submit" className={`${primaryButton} w-full py-3`}>
        {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
        {pending ? 'მიმდინარეობს…' : 'შესვლა'}
      </button>
    </fieldset>
  );
}
