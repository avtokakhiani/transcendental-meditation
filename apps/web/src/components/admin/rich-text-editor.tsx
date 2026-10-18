'use client';

import Highlight from '@tiptap/extension-highlight';
import { TaskItem, TaskList } from '@tiptap/extension-list';
import { TableKit } from '@tiptap/extension-table';
import TextAlign from '@tiptap/extension-text-align';
import { Color, TextStyle } from '@tiptap/extension-text-style';
import { Placeholder } from '@tiptap/extensions';
import { Markdown } from '@tiptap/markdown';
import type { EditorView } from '@tiptap/pm/view';
import { EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import type { ContentFormat } from '@tm/shared';
import { useMemo, useRef, useState } from 'react';
import { ImageBubbleMenu, TableBubbleMenu } from './editor/bubble-menus';
import { Panel, RichImage, SlashCommand, type SlashBridge } from './editor/extensions';
import { buildSlashItems, filterSlashItems } from './editor/slash-items';
import { SlashMenu, type SlashMenuState } from './editor/slash-menu';
import { EditorToolbar } from './editor/toolbar';
import { uploadImage } from './upload-image';

const IMAGE_ACCEPT = 'image/jpeg,image/png,image/webp,image/gif';

function firstImage(files: FileList | null | undefined): File | null {
  return Array.from(files ?? []).find((file) => file.type.startsWith('image/')) ?? null;
}

/**
 * Jira-style rich editor (Tiptap). Saves HTML, which the server sanitizes against the same set of
 * features this editor can produce. Legacy Markdown content is opened as-is and converted to HTML
 * the first time it is edited.
 */
export function RichTextEditor({
  name,
  defaultValue = '',
  defaultFormat = 'markdown',
  minHeight = '28rem',
}: {
  name: string;
  defaultValue?: string;
  defaultFormat?: ContentFormat | string;
  minHeight?: string;
}) {
  // Submitted untouched until the first edit, so opening and saving never rewrites old content.
  const [value, setValue] = useState({ content: defaultValue, format: defaultFormat === 'html' ? 'html' : 'markdown' });
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [slash, setSlash] = useState<SlashMenuState | null>(null);
  const fileInput = useRef<HTMLInputElement>(null);
  const slashRef = useRef<SlashMenuState | null>(null);
  const bridge = useRef<SlashBridge | null>(null);

  const updateSlash = (next: SlashMenuState | null) => {
    slashRef.current = next;
    setSlash(next);
  };

  async function insertUploaded(file: File, view?: EditorView, pos?: number) {
    setUploading(true);
    setError(null);
    try {
      const src = await uploadImage(file);
      const alt = file.name.replace(/\.[^.]+$/, '');
      const target = view ?? editor?.view;
      if (target === undefined) return;
      const node = target.state.schema.nodes.image!.create({ src, alt });
      const tr = pos === undefined ? target.state.tr.replaceSelectionWith(node) : target.state.tr.insert(pos, node);
      target.dispatch(tr.scrollIntoView());
      target.focus();
    } catch (uploadError) {
      setError(uploadError instanceof Error ? uploadError.message : 'ატვირთვა ვერ მოხერხდა');
    } finally {
      setUploading(false);
    }
  }

  const pickImage = () => fileInput.current?.click();
  const slashItems = useMemo(() => buildSlashItems(() => fileInput.current?.click()), []);

  bridge.current = {
    items: (query) => filterSlashItems(slashItems, query).slice(0, 30),
    onOpen: (props) => updateSlash({ items: props.items, selected: 0, rect: props.clientRect?.() ?? null, command: props.command }),
    onUpdate: (props) => updateSlash({ items: props.items, selected: 0, rect: props.clientRect?.() ?? null, command: props.command }),
    onKeyDown: ({ event }) => {
      const current = slashRef.current;
      if (current === null) return false;
      if (event.key === 'Escape') {
        updateSlash(null);
        return true;
      }
      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        const count = current.items.length || 1;
        const delta = event.key === 'ArrowDown' ? 1 : -1;
        updateSlash({ ...current, selected: (current.selected + delta + count) % count });
        return true;
      }
      if (event.key === 'Enter' || event.key === 'Tab') {
        const item = current.items[current.selected];
        if (item === undefined) return false;
        current.command(item);
        return true;
      }
      return false;
    },
    onClose: () => updateSlash(null),
  };

  const extensions = useMemo(
    () => [
      StarterKit.configure({
        heading: { levels: [1, 2, 3] },
        link: { openOnClick: false, autolink: true, defaultProtocol: 'https' },
      }),
      RichImage,
      TableKit.configure({ table: { resizable: true, cellMinWidth: 60 } }),
      TaskList,
      TaskItem.configure({ nested: true }),
      TextAlign.configure({ types: ['heading', 'paragraph'] }),
      TextStyle,
      Color,
      Highlight.configure({ multicolor: true }),
      Panel,
      SlashCommand.configure({ bridge }),
      Placeholder.configure({
        placeholder: ({ node }) => (node.type.name === 'heading' ? 'სათაური' : 'დაწერეთ ტექსტი ან აკრიფეთ „/“ ბრძანებებისთვის…'),
      }),
      // Only for reading legacy Markdown content; everything is saved as HTML.
      Markdown,
    ],
    [],
  );

  const editor = useEditor({
    extensions,
    content: defaultValue,
    contentType: defaultFormat === 'html' ? 'html' : 'markdown',
    immediatelyRender: false,
    editorProps: {
      attributes: {
        class: 'prose prose-tm rich-content max-w-none px-6 py-5 outline-none sm:px-10 sm:py-8',
        style: `min-height: ${minHeight}`,
      },
      handlePaste: (view, event) => {
        const file = firstImage(event.clipboardData?.files);
        if (file === null) return false;
        void insertUploaded(file, view);
        return true;
      },
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const file = firstImage(event.dataTransfer?.files);
        if (file === null) return false;
        const pos = view.posAtCoords({ left: event.clientX, top: event.clientY })?.pos;
        void insertUploaded(file, view, pos);
        return true;
      },
    },
    onUpdate: ({ editor: current }) => setValue({ content: current.getHTML(), format: 'html' }),
  });

  return (
    <div className="rounded-2xl border border-cream-300 bg-white">
      <input type="hidden" name={name} value={value.content} />
      <input type="hidden" name={`${name}Format`} value={value.format} />

      <div className="sticky top-0 z-20 rounded-t-2xl border-b border-cream-300 bg-cream-50/95 px-2 py-1.5 backdrop-blur">
        {editor === null ? <div className="h-8" /> : <EditorToolbar editor={editor} uploading={uploading} onPickImage={pickImage} />}
      </div>
      <input
        ref={fileInput}
        type="file"
        accept={IMAGE_ACCEPT}
        hidden
        onChange={(event) => {
          const file = firstImage(event.target.files);
          if (file !== null) void insertUploaded(file);
          event.target.value = '';
        }}
      />

      {error !== null ? <p className="border-b border-rose-100 bg-rose-50 px-4 py-2 text-sm text-rose-700">{error}</p> : null}

      {editor === null ? (
        <div className="animate-pulse px-10 py-8" style={{ minHeight }}>
          <div className="h-4 w-2/3 rounded bg-cream-200" />
          <div className="mt-4 h-4 w-1/2 rounded bg-cream-200" />
        </div>
      ) : (
        <>
          <EditorContent editor={editor} />
          <ImageBubbleMenu editor={editor} />
          <TableBubbleMenu editor={editor} />
        </>
      )}

      {slash !== null ? <SlashMenu state={slash} onHover={(index) => updateSlash({ ...slash, selected: index })} /> : null}
    </div>
  );
}
