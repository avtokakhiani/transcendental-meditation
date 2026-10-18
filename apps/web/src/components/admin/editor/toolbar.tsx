'use client';

import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import {
  AlignCenter,
  AlignJustify,
  AlignLeft,
  AlignRight,
  Baseline,
  Bold,
  Check,
  Code,
  Ellipsis,
  ImagePlus,
  Italic,
  Link2,
  List,
  ListOrdered,
  ListTodo,
  LoaderCircle,
  Minus,
  PanelTop,
  Plus,
  Quote,
  Redo2,
  RemoveFormatting,
  SquareCode,
  Strikethrough,
  Table,
  Underline,
  Undo2,
  Unlink,
} from 'lucide-react';
import { useState } from 'react';
import { HIGHLIGHTS, PANELS, TEXT_COLORS } from './constants';
import { Divider, Dropdown, MenuItem, ToolbarButton, keepSelection } from './primitives';

const BLOCK_TYPES = [
  { key: 'p', label: 'ჩვეულებრივი ტექსტი', className: 'text-sm' },
  { key: 'h1', label: 'სათაური 1', className: 'text-xl font-medium' },
  { key: 'h2', label: 'სათაური 2', className: 'text-lg font-medium' },
  { key: 'h3', label: 'სათაური 3', className: 'text-base font-medium' },
] as const;

const ALIGNMENTS = [
  { value: 'left', label: 'მარცხნივ', icon: AlignLeft },
  { value: 'center', label: 'ცენტრში', icon: AlignCenter },
  { value: 'right', label: 'მარჯვნივ', icon: AlignRight },
  { value: 'justify', label: 'გასწორება', icon: AlignJustify },
] as const;

/** Picks a table size by hovering a grid, as in Jira and Google Docs. */
function TableGridPicker({ onPick }: { onPick: (rows: number, cols: number) => void }) {
  const [hover, setHover] = useState({ rows: 0, cols: 0 });
  const size = 6;
  return (
    <div className="p-1.5">
      <div className="grid grid-cols-6 gap-1" onMouseLeave={() => setHover({ rows: 0, cols: 0 })}>
        {Array.from({ length: size * size }, (_, index) => {
          const row = Math.floor(index / size) + 1;
          const col = (index % size) + 1;
          const lit = row <= hover.rows && col <= hover.cols;
          return (
            <button
              key={index}
              type="button"
              aria-label={`${row} × ${col}`}
              onMouseDown={keepSelection}
              onMouseEnter={() => setHover({ rows: row, cols: col })}
              onClick={() => onPick(row, col)}
              className={`size-5 rounded-[3px] border transition ${lit ? 'border-plum-500 bg-plum-300/60' : 'border-cream-300 bg-cream-50'}`}
            />
          );
        })}
      </div>
      <p className="mt-2 text-center text-xs text-plum-500 tabular-nums">
        {hover.rows > 0 ? `${hover.rows} × ${hover.cols}` : 'აირჩიეთ ზომა'}
      </p>
    </div>
  );
}

function LinkControl({ editor, active }: { editor: Editor; active: boolean }) {
  const [url, setUrl] = useState('');

  return (
    <Dropdown label="ბმული (Ctrl+K)" trigger={<Link2 aria-hidden="true" className="size-4" />} active={active} wide>
      {(close) => {
        const current = (editor.getAttributes('link').href as string | undefined) ?? '';
        const apply = () => {
          const value = (url || current).trim();
          if (value === '') return;
          const href = /^(https?:|mailto:|tel:|\/)/i.test(value) ? value : `https://${value}`;
          editor.chain().focus().extendMarkRange('link').setLink({ href }).run();
          setUrl('');
          close();
        };
        return (
          <div className="p-1.5">
            <label className="block text-xs text-plum-500">
              ბმულის მისამართი
              <input
                autoFocus
                defaultValue={current}
                onChange={(event) => setUrl(event.target.value)}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') {
                    event.preventDefault();
                    apply();
                  }
                }}
                placeholder="https://"
                className="mt-1 w-full rounded-lg border border-cream-300 px-2.5 py-2 text-sm text-plum-900 outline-none focus:border-plum-400"
              />
            </label>
            <div className="mt-2 flex gap-2">
              <button type="button" onClick={apply} className="flex-1 rounded-lg bg-plum-800 px-3 py-1.5 text-sm text-cream-100 hover:bg-plum-700">
                შენახვა
              </button>
              {current !== '' ? (
                <button
                  type="button"
                  title="ბმულის მოხსნა"
                  onClick={() => {
                    editor.chain().focus().extendMarkRange('link').unsetLink().run();
                    close();
                  }}
                  className="grid size-8 place-items-center rounded-lg border border-cream-300 text-plum-600 hover:bg-cream-100"
                >
                  <Unlink aria-hidden="true" className="size-4" />
                </button>
              ) : null}
            </div>
          </div>
        );
      }}
    </Dropdown>
  );
}

export function EditorToolbar({
  editor,
  uploading,
  onPickImage,
}: {
  editor: Editor;
  uploading: boolean;
  onPickImage: () => void;
}) {
  const state = useEditorState({
    editor,
    selector: ({ editor: e }) => ({
      block: e.isActive('heading', { level: 1 }) ? 'h1' : e.isActive('heading', { level: 2 }) ? 'h2' : e.isActive('heading', { level: 3 }) ? 'h3' : 'p',
      bold: e.isActive('bold'),
      italic: e.isActive('italic'),
      underline: e.isActive('underline'),
      strike: e.isActive('strike'),
      code: e.isActive('code'),
      color: (e.getAttributes('textStyle').color as string | undefined) ?? null,
      highlight: (e.getAttributes('highlight').color as string | undefined) ?? null,
      bullet: e.isActive('bulletList'),
      ordered: e.isActive('orderedList'),
      task: e.isActive('taskList'),
      align: ALIGNMENTS.find((a) => e.isActive({ textAlign: a.value }))?.value ?? 'left',
      link: e.isActive('link'),
      quote: e.isActive('blockquote'),
      codeBlock: e.isActive('codeBlock'),
      panel: e.isActive('panel'),
      canUndo: e.can().undo(),
      canRedo: e.can().redo(),
    }),
  });

  const chain = () => editor.chain().focus();
  const currentBlock = BLOCK_TYPES.find((type) => type.key === state.block) ?? BLOCK_TYPES[0];
  const AlignIcon = ALIGNMENTS.find((a) => a.value === state.align)?.icon ?? AlignLeft;

  return (
    <div className="flex flex-wrap items-center gap-0.5">
      <Dropdown label="ტექსტის სტილი" trigger={<span className="w-28 truncate text-left text-[13px]">{currentBlock.label}</span>}>
        {(close) =>
          BLOCK_TYPES.map((type) => (
            <MenuItem
              key={type.key}
              active={type.key === state.block}
              onSelect={() => {
                if (type.key === 'p') chain().setParagraph().run();
                else chain().setHeading({ level: Number(type.key[1]) as 1 | 2 | 3 }).run();
                close();
              }}
            >
              <span className={`flex-1 ${type.className}`}>{type.label}</span>
              {type.key === state.block ? <Check aria-hidden="true" className="size-4" /> : null}
            </MenuItem>
          ))
        }
      </Dropdown>

      <Divider />

      <ToolbarButton label="მუქი (Ctrl+B)" active={state.bold} onClick={() => chain().toggleBold().run()}>
        <Bold aria-hidden="true" className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="დახრილი (Ctrl+I)" active={state.italic} onClick={() => chain().toggleItalic().run()}>
        <Italic aria-hidden="true" className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="ხაზგასმული (Ctrl+U)" active={state.underline} onClick={() => chain().toggleUnderline().run()}>
        <Underline aria-hidden="true" className="size-4" />
      </ToolbarButton>
      <Dropdown label="მეტი ფორმატირება" trigger={<Ellipsis aria-hidden="true" className="size-4" />} active={state.strike || state.code}>
        {(close) => (
          <>
            <MenuItem active={state.strike} onSelect={() => { chain().toggleStrike().run(); close(); }}>
              <Strikethrough aria-hidden="true" className="size-4" /> გადახაზული
            </MenuItem>
            <MenuItem active={state.code} onSelect={() => { chain().toggleCode().run(); close(); }}>
              <Code aria-hidden="true" className="size-4" /> კოდი ტექსტში
            </MenuItem>
            <MenuItem onSelect={() => { chain().unsetAllMarks().clearNodes().run(); close(); }}>
              <RemoveFormatting aria-hidden="true" className="size-4" /> ფორმატირების მოხსნა
            </MenuItem>
          </>
        )}
      </Dropdown>

      <Dropdown
        label="ტექსტის ფერი"
        trigger={
          <span className="flex flex-col items-center">
            <Baseline aria-hidden="true" className="size-4" />
            <span className="-mt-0.5 h-1 w-4 rounded-full" style={{ background: state.color ?? state.highlight ?? '#3b2742' }} />
          </span>
        }
        wide
      >
        {(close) => (
          <div className="p-1.5">
            <p className="mb-2 text-xs text-plum-500">ტექსტის ფერი</p>
            <div className="grid grid-cols-5 gap-1.5">
              {TEXT_COLORS.map((color) => (
                <button
                  key={color.label}
                  type="button"
                  title={color.label}
                  aria-label={color.label}
                  onMouseDown={keepSelection}
                  onClick={() => {
                    if (color.value === null) chain().unsetColor().run();
                    else chain().setColor(color.value).run();
                    close();
                  }}
                  className={`grid h-8 place-items-center rounded-md border text-sm font-semibold ${
                    state.color === color.value ? 'border-plum-700 ring-2 ring-plum-300' : 'border-cream-300'
                  }`}
                  style={{ color: color.value ?? '#3b2742' }}
                >
                  ა
                </button>
              ))}
            </div>
            <p className="mb-2 mt-3 text-xs text-plum-500">ფონის ფერი</p>
            <div className="grid grid-cols-6 gap-1.5">
              {HIGHLIGHTS.map((color) => (
                <button
                  key={color.label}
                  type="button"
                  title={color.label}
                  aria-label={color.label}
                  onMouseDown={keepSelection}
                  onClick={() => {
                    if (color.value === null) chain().unsetHighlight().run();
                    else chain().setHighlight({ color: color.value }).run();
                    close();
                  }}
                  className={`h-7 rounded-md border ${state.highlight === color.value ? 'border-plum-700 ring-2 ring-plum-300' : 'border-cream-300'} ${
                    color.value === null ? 'bg-[linear-gradient(135deg,transparent_45%,#c9372c_45%,#c9372c_55%,transparent_55%)]' : ''
                  }`}
                  style={color.value ? { background: color.value } : undefined}
                />
              ))}
            </div>
          </div>
        )}
      </Dropdown>

      <Divider />

      <ToolbarButton label="სია" active={state.bullet} onClick={() => chain().toggleBulletList().run()}>
        <List aria-hidden="true" className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="დანომრილი სია" active={state.ordered} onClick={() => chain().toggleOrderedList().run()}>
        <ListOrdered aria-hidden="true" className="size-4" />
      </ToolbarButton>
      <ToolbarButton label="ჩამონათვალი" active={state.task} onClick={() => chain().toggleTaskList().run()}>
        <ListTodo aria-hidden="true" className="size-4" />
      </ToolbarButton>
      <Dropdown label="სწორება" trigger={<AlignIcon aria-hidden="true" className="size-4" />}>
        {(close) =>
          ALIGNMENTS.map(({ value, label, icon: Icon }) => (
            <MenuItem key={value} active={state.align === value} onSelect={() => { chain().setTextAlign(value).run(); close(); }}>
              <Icon aria-hidden="true" className="size-4" /> {label}
            </MenuItem>
          ))
        }
      </Dropdown>

      <Divider />

      <LinkControl editor={editor} active={state.link} />
      <ToolbarButton label="სურათი" disabled={uploading} onClick={onPickImage}>
        {uploading ? <LoaderCircle aria-hidden="true" className="size-4 animate-spin" /> : <ImagePlus aria-hidden="true" className="size-4" />}
      </ToolbarButton>
      <Dropdown label="ცხრილი" trigger={<Table aria-hidden="true" className="size-4" />}>
        {(close) => (
          <TableGridPicker
            onPick={(rows, cols) => {
              chain().insertTable({ rows, cols, withHeaderRow: true }).run();
              close();
            }}
          />
        )}
      </Dropdown>
      <Dropdown label="პანელი" trigger={<PanelTop aria-hidden="true" className="size-4" />} active={state.panel}>
        {(close) => (
          <>
            {PANELS.map(({ variant, label, icon: Icon, swatch }) => (
              <MenuItem key={variant} active={editor.isActive('panel', { variant })} onSelect={() => { chain().setPanel(variant).run(); close(); }}>
                <Icon aria-hidden="true" className={`size-4 ${swatch}`} /> {label}
              </MenuItem>
            ))}
            {state.panel ? (
              <MenuItem onSelect={() => { chain().unsetPanel().run(); close(); }}>
                <RemoveFormatting aria-hidden="true" className="size-4" /> პანელის მოხსნა
              </MenuItem>
            ) : null}
          </>
        )}
      </Dropdown>
      <Dropdown label="მეტის ჩასმა" trigger={<Plus aria-hidden="true" className="size-4" />} active={state.quote || state.codeBlock}>
        {(close) => (
          <>
            <MenuItem active={state.quote} onSelect={() => { chain().toggleBlockquote().run(); close(); }}>
              <Quote aria-hidden="true" className="size-4" /> ციტატა
            </MenuItem>
            <MenuItem active={state.codeBlock} onSelect={() => { chain().toggleCodeBlock().run(); close(); }}>
              <SquareCode aria-hidden="true" className="size-4" /> კოდის ბლოკი
            </MenuItem>
            <MenuItem onSelect={() => { chain().setHorizontalRule().run(); close(); }}>
              <Minus aria-hidden="true" className="size-4" /> გამყოფი ხაზი
            </MenuItem>
            <p className="mt-1 border-t border-cream-200 px-3 pb-1 pt-2 text-xs text-plum-400">მინიშნება: აკრიფეთ „/“ ტექსტში</p>
          </>
        )}
      </Dropdown>

      <div className="ml-auto flex items-center">
        <ToolbarButton label="დაბრუნება (Ctrl+Z)" disabled={!state.canUndo} onClick={() => chain().undo().run()}>
          <Undo2 aria-hidden="true" className="size-4" />
        </ToolbarButton>
        <ToolbarButton label="გამეორება (Ctrl+Shift+Z)" disabled={!state.canRedo} onClick={() => chain().redo().run()}>
          <Redo2 aria-hidden="true" className="size-4" />
        </ToolbarButton>
      </div>
    </div>
  );
}
