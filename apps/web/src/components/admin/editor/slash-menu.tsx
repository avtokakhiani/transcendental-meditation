'use client';

import type { SlashItem } from './extensions';
import { keepSelection } from './primitives';

export interface SlashMenuState {
  items: SlashItem[];
  selected: number;
  rect: DOMRect | null;
  command: (item: SlashItem) => void;
}

export function SlashMenu({ state, onHover }: { state: SlashMenuState; onHover: (index: number) => void }) {
  if (state.rect === null) return null;

  // Opens below the caret; flips above when there is no room left in the viewport.
  const below = state.rect.bottom + 330 < window.innerHeight;
  const style: React.CSSProperties = {
    position: 'fixed',
    left: Math.min(state.rect.left, window.innerWidth - 300),
    ...(below ? { top: state.rect.bottom + 6 } : { bottom: window.innerHeight - state.rect.top + 6 }),
  };

  let lastGroup = '';
  return (
    <div
      style={style}
      role="listbox"
      aria-label="ჩასმის ბრძანებები"
      className="z-50 max-h-80 w-72 overflow-y-auto rounded-xl border border-cream-300 bg-white p-1.5 shadow-2xl shadow-plum-900/15"
    >
      {state.items.length === 0 ? (
        <p className="px-3 py-2 text-sm text-plum-400">ვერაფერი მოიძებნა</p>
      ) : (
        state.items.map((item, index) => {
          const showGroup = item.group !== lastGroup;
          lastGroup = item.group;
          const Icon = item.icon;
          return (
            <div key={item.title}>
              {showGroup ? <p className="px-3 pb-1 pt-2 text-[11px] uppercase tracking-wider text-plum-400">{item.group}</p> : null}
              <button
                type="button"
                role="option"
                aria-selected={index === state.selected}
                ref={(element) => {
                  if (index === state.selected) element?.scrollIntoView({ block: 'nearest' });
                }}
                onMouseDown={keepSelection}
                onMouseEnter={() => onHover(index)}
                onClick={() => state.command(item)}
                className={`flex w-full items-center gap-3 rounded-lg px-2.5 py-2 text-left ${index === state.selected ? 'bg-cream-100' : ''}`}
              >
                <span className="grid size-9 shrink-0 place-items-center rounded-lg border border-cream-300 bg-white text-plum-700">
                  <Icon aria-hidden="true" className="size-4" />
                </span>
                <span className="min-w-0">
                  <span className="block truncate text-sm text-plum-900">{item.title}</span>
                  <span className="block truncate text-xs text-plum-400">{item.description}</span>
                </span>
              </button>
            </div>
          );
        })
      )}
    </div>
  );
}
