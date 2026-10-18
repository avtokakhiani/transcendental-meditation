'use client';

import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import { BubbleMenu } from '@tiptap/react/menus';
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BetweenHorizontalEnd,
  BetweenHorizontalStart,
  BetweenVerticalEnd,
  BetweenVerticalStart,
  Columns3,
  Rows3,
  TableCellsMerge,
  Trash2,
  Type,
  WrapText,
} from 'lucide-react';
import type { ImageAlign } from './extensions';
import { Divider, ToolbarButton } from './primitives';

const menuClass = 'flex items-center gap-0.5 rounded-xl border border-cream-300 bg-white p-1 shadow-xl shadow-plum-900/15';

const ALIGN_OPTIONS: ReadonlyArray<{ value: ImageAlign; label: string; icon: typeof AlignLeft; flip?: boolean }> = [
  { value: 'left', label: 'მარცხნივ', icon: AlignLeft },
  { value: 'center', label: 'ცენტრში', icon: AlignCenter },
  { value: 'right', label: 'მარჯვნივ', icon: AlignRight },
  { value: 'wrap-left', label: 'ტექსტი მარჯვნიდან (სურათი მარცხნივ)', icon: WrapText },
  { value: 'wrap-right', label: 'ტექსტი მარცხნიდან (სურათი მარჯვნივ)', icon: WrapText, flip: true },
];

const SIZES = [25, 50, 75, 100] as const;

export function ImageBubbleMenu({ editor }: { editor: Editor }) {
  const image = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      align: (e.getAttributes('image').align as ImageAlign | undefined) ?? 'center',
      width: (e.getAttributes('image').width as number | null | undefined) ?? null,
      alt: (e.getAttributes('image').alt as string | null | undefined) ?? '',
    }),
  });

  return (
    <BubbleMenu
      editor={editor}
      pluginKey="imageMenu"
      shouldShow={({ editor: e }) => e.isActive('image')}
      options={{ placement: 'top', offset: 8 }}
      className={menuClass}
    >
      {ALIGN_OPTIONS.map(({ value, label, icon: Icon, flip }) => (
        <ToolbarButton
          key={value}
          label={label}
          active={image.align === value}
          onClick={() => editor.chain().focus().updateAttributes('image', { align: value }).run()}
        >
          <Icon aria-hidden="true" className={`size-4 ${flip ? '-scale-x-100' : ''}`} />
        </ToolbarButton>
      ))}
      <Divider />
      {SIZES.map((size) => (
        <ToolbarButton
          key={size}
          label={`სიგანე ${size}%`}
          active={image.width === size || (size === 100 && image.width === null && image.align === 'center')}
          onClick={() => editor.chain().focus().updateAttributes('image', { width: size }).run()}
          className="text-xs tabular-nums"
        >
          {size}%
        </ToolbarButton>
      ))}
      <Divider />
      <ToolbarButton
        label="ალტერნატიული ტექსტი"
        active={image.alt !== ''}
        onClick={() => {
          const alt = window.prompt('სურათის აღწერა (ეკრანის წამკითხველებისთვის და SEO-სთვის)', image.alt);
          if (alt !== null) editor.chain().focus().updateAttributes('image', { alt: alt.trim() }).run();
        }}
      >
        <Type aria-hidden="true" className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="სურათის წაშლა" onClick={() => editor.chain().focus().deleteSelection().run()}>
        <Trash2 aria-hidden="true" className="size-4 text-rose-600" />
      </ToolbarButton>
    </BubbleMenu>
  );
}

/** Anchors the table menu to the whole table rather than the caret inside one cell. */
function tableReference(editor: Editor) {
  const { $from } = editor.state.selection;
  for (let depth = $from.depth; depth > 0; depth -= 1) {
    if ($from.node(depth).type.name === 'table') {
      const dom = editor.view.nodeDOM($from.before(depth));
      if (dom instanceof HTMLElement) return { getBoundingClientRect: () => dom.getBoundingClientRect() };
    }
  }
  return null;
}

export function TableBubbleMenu({ editor }: { editor: Editor }) {
  return (
    <BubbleMenu
      editor={editor}
      pluginKey="tableMenu"
      shouldShow={({ editor: e }) => e.isActive('table') && !e.isActive('image')}
      getReferencedVirtualElement={() => tableReference(editor)}
      options={{ placement: 'top', offset: 8, flip: true }}
      className={menuClass}
    >
      <ToolbarButton label="მწკრივი ზემოთ" onClick={() => editor.chain().focus().addRowBefore().run()}>
        <BetweenHorizontalStart aria-hidden="true" className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="მწკრივი ქვემოთ" onClick={() => editor.chain().focus().addRowAfter().run()}>
        <BetweenHorizontalEnd aria-hidden="true" className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="სვეტი მარცხნივ" onClick={() => editor.chain().focus().addColumnBefore().run()}>
        <BetweenVerticalStart aria-hidden="true" className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="სვეტი მარჯვნივ" onClick={() => editor.chain().focus().addColumnAfter().run()}>
        <BetweenVerticalEnd aria-hidden="true" className="size-4" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="სათაურის მწკრივი" onClick={() => editor.chain().focus().toggleHeaderRow().run()}>
        <Rows3 aria-hidden="true" className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="უჯრების გაერთიანება / გაყოფა" onClick={() => editor.chain().focus().mergeOrSplit().run()}>
        <TableCellsMerge aria-hidden="true" className="size-4" />
      </ToolbarButton>
      <Divider />
      <ToolbarButton label="მწკრივის წაშლა" onClick={() => editor.chain().focus().deleteRow().run()}>
        <Rows3 aria-hidden="true" className="size-4 text-rose-600" />
      </ToolbarButton>
      <ToolbarButton label="სვეტის წაშლა" onClick={() => editor.chain().focus().deleteColumn().run()}>
        <Columns3 aria-hidden="true" className="size-4 text-rose-600" />
      </ToolbarButton>
      <ToolbarButton label="ცხრილის წაშლა" onClick={() => editor.chain().focus().deleteTable().run()}>
        <Trash2 aria-hidden="true" className="size-4 text-rose-600" />
      </ToolbarButton>
    </BubbleMenu>
  );
}
