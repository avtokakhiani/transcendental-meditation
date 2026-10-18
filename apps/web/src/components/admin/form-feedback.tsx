'use client';

import { LoaderCircle } from 'lucide-react';
import { useFormStatus } from 'react-dom';
import { primaryButton } from './ui';

export interface FormState {
  error: string | null;
}

export function SubmitButton({ children }: { children: React.ReactNode }) {
  const { pending } = useFormStatus();
  return (
    <button type="submit" disabled={pending} className={primaryButton}>
      {pending ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : null}
      {children}
    </button>
  );
}

export function FormMessages({ state, saved }: { state: FormState; saved?: boolean }) {
  if (state.error !== null) {
    return <p role="alert" className="rounded-xl bg-rose-50 px-4 py-3 text-sm text-rose-700">{state.error}</p>;
  }
  if (saved === true) {
    return <p role="status" className="rounded-xl bg-emerald-50 px-4 py-3 text-sm text-emerald-800">შენახულია</p>;
  }
  return null;
}
