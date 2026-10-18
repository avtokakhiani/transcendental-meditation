'use client';

import { ChevronDown } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';

/** Stops the editor losing its selection when a toolbar control takes the mouse. */
export const keepSelection = (event: React.MouseEvent) => event.preventDefault();

export function ToolbarButton({
  label,
  active = false,
  disabled = false,
  onClick,
  children,
  className = '',
}: {
  label: string;
  active?: boolean;
  disabled?: boolean;
  onClick: () => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <button
      type="button"
      title={label}
      aria-label={label}
      aria-pressed={active}
      disabled={disabled}
      onMouseDown={keepSelection}
      onClick={onClick}
      className={`grid h-8 min-w-8 place-items-center rounded-md px-1.5 transition disabled:opacity-30 ${
        active ? 'bg-plum-800 text-cream-100' : 'text-plum-700 hover:bg-cream-200 hover:text-plum-900'
      } ${className}`}
    >
      {children}
    </button>
  );
}

export function Divider() {
  return <span aria-hidden="true" className="mx-1 h-5 w-px shrink-0 bg-cream-300" />;
}

/** Toolbar dropdown: closes on outside click, Escape, or when an item calls `close`. */
export function Dropdown({
  label,
  trigger,
  active = false,
  children,
  align = 'left',
  wide = false,
}: {
  label: string;
  trigger: React.ReactNode;
  active?: boolean;
  children: (close: () => void) => React.ReactNode;
  align?: 'left' | 'right';
  wide?: boolean;
}) {
  const [open, setOpen] = useState(false);
  const root = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!root.current?.contains(event.target as globalThis.Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false);
    document.addEventListener('mousedown', onPointer);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onPointer);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  return (
    <div ref={root} className="relative">
      <button
        type="button"
        title={label}
        aria-label={label}
        aria-expanded={open}
        aria-haspopup="menu"
        onMouseDown={keepSelection}
        onClick={() => setOpen((value) => !value)}
        className={`flex h-8 items-center gap-0.5 rounded-md px-1.5 transition ${
          active || open ? 'bg-cream-200 text-plum-900' : 'text-plum-700 hover:bg-cream-200 hover:text-plum-900'
        }`}
      >
        {trigger}
        <ChevronDown aria-hidden="true" className="size-3 opacity-60" />
      </button>
      {open ? (
        <div
          role="menu"
          className={`absolute top-full z-30 mt-1 rounded-xl border border-cream-300 bg-white p-1.5 shadow-xl shadow-plum-900/10 ${
            align === 'right' ? 'right-0' : 'left-0'
          } ${wide ? 'w-64' : 'min-w-48'}`}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

export function MenuItem({
  onSelect,
  active = false,
  children,
}: {
  onSelect: () => void;
  active?: boolean;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      role="menuitem"
      onMouseDown={keepSelection}
      onClick={onSelect}
      className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition hover:bg-cream-100 ${
        active ? 'bg-cream-100 text-plum-900' : 'text-plum-700'
      }`}
    >
      {children}
    </button>
  );
}
