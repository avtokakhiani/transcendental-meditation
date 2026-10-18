'use client';

import { NodeViewWrapper, type NodeViewProps } from '@tiptap/react';
import { useRef } from 'react';

const MIN_PERCENT = 10;

/** Image node with drag handles; width is committed as a percentage of the text column. */
export function ImageView({ node, updateAttributes, selected, editor }: NodeViewProps) {
  const wrapper = useRef<HTMLDivElement>(null);
  const { src, alt, width, align } = node.attrs as { src: string; alt: string | null; width: number | null; align: string };

  function startResize(event: React.PointerEvent, side: 'left' | 'right') {
    event.preventDefault();
    event.stopPropagation();
    const element = wrapper.current;
    if (element === null) return;

    const column = editor.view.dom as HTMLElement;
    const style = getComputedStyle(column);
    const columnWidth = column.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
    const startX = event.clientX;
    const startWidth = element.getBoundingClientRect().width;
    // Centered images grow from both sides, so the pointer covers half the change.
    const factor = (side === 'right' ? 1 : -1) * (align === 'center' ? 2 : 1);
    let percent = width ?? (startWidth / columnWidth) * 100;

    const onMove = (move: PointerEvent) => {
      const next = startWidth + (move.clientX - startX) * factor;
      percent = Math.min(100, Math.max(MIN_PERCENT, (next / columnWidth) * 100));
      element.style.width = `${percent}%`;
    };
    const onUp = () => {
      window.removeEventListener('pointermove', onMove);
      window.removeEventListener('pointerup', onUp);
      updateAttributes({ width: Math.round(percent) });
    };
    window.addEventListener('pointermove', onMove);
    window.addEventListener('pointerup', onUp);
  }

  const handle =
    'absolute top-1/2 h-12 w-2.5 -translate-y-1/2 cursor-ew-resize rounded-full border-2 border-white bg-saffron-500 shadow';

  return (
    <NodeViewWrapper
      ref={wrapper}
      className={`rich-image ${selected ? 'is-selected' : ''}`}
      data-align={align}
      style={width ? { width: `${width}%` } : undefined}
      data-drag-handle=""
    >
      <img src={src} alt={alt ?? ''} draggable={false} />
      {selected && editor.isEditable ? (
        <>
          <span role="presentation" onPointerDown={(event) => startResize(event, 'left')} className={`${handle} -left-1.5`} />
          <span role="presentation" onPointerDown={(event) => startResize(event, 'right')} className={`${handle} -right-1.5`} />
          {width ? (
            <span className="absolute bottom-2 right-2 rounded bg-plum-900/75 px-1.5 py-0.5 text-[11px] text-white tabular-nums">
              {width}%
            </span>
          ) : null}
        </>
      ) : null}
    </NodeViewWrapper>
  );
}
