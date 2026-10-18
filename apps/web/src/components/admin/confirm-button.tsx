'use client';

import { dangerButton } from './ui';

/** Submit button that asks first; deletes here cannot be undone. */
export function ConfirmButton({ message, children, className = dangerButton }: { message: string; children: React.ReactNode; className?: string }) {
  return (
    <button
      type="submit"
      className={className}
      onClick={(event) => {
        if (!confirm(message)) event.preventDefault();
      }}
    >
      {children}
    </button>
  );
}
