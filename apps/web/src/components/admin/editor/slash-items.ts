import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  ImagePlus,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Pilcrow,
  Quote,
  Table,
} from 'lucide-react';
import { PANELS } from './constants';
import type { SlashItem } from './extensions';

/** Everything the "/" menu can insert. `pickImage` opens the upload dialog owned by the editor. */
export function buildSlashItems(pickImage: () => void): SlashItem[] {
  return [
    { group: 'ტექსტი', title: 'ტექსტი', description: 'ჩვეულებრივი აბზაცი', keywords: ['text', 'paragraph', 'p'], icon: Pilcrow,
      run: (editor, range) => editor.chain().focus().deleteRange(range).setParagraph().run() },
    { group: 'ტექსტი', title: 'სათაური 1', description: 'დიდი სათაური', keywords: ['h1', 'heading'], icon: Heading1,
      run: (editor, range) => editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run() },
    { group: 'ტექსტი', title: 'სათაური 2', description: 'საშუალო სათაური', keywords: ['h2', 'heading'], icon: Heading2,
      run: (editor, range) => editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run() },
    { group: 'ტექსტი', title: 'სათაური 3', description: 'პატარა სათაური', keywords: ['h3', 'heading'], icon: Heading3,
      run: (editor, range) => editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run() },
    { group: 'სიები', title: 'სია', description: 'პუნქტებიანი სია', keywords: ['bullet', 'list', 'ul'], icon: List,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBulletList().run() },
    { group: 'სიები', title: 'დანომრილი სია', description: '1, 2, 3…', keywords: ['ordered', 'number', 'ol'], icon: ListOrdered,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleOrderedList().run() },
    { group: 'სიები', title: 'ჩამონათვალი', description: 'მოსანიშნი პუნქტები', keywords: ['task', 'todo', 'check'], icon: ListTodo,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleTaskList().run() },
    { group: 'ჩასმა', title: 'სურათი', description: 'ატვირთეთ კომპიუტერიდან', keywords: ['image', 'photo', 'img'], icon: ImagePlus,
      run: (editor, range) => {
        editor.chain().focus().deleteRange(range).run();
        pickImage();
      } },
    { group: 'ჩასმა', title: 'ცხრილი', description: '3 × 3 ცხრილი სათაურით', keywords: ['table', 'grid'], icon: Table,
      run: (editor, range) => editor.chain().focus().deleteRange(range).insertTable({ rows: 3, cols: 3, withHeaderRow: true }).run() },
    ...PANELS.map(({ variant, label, icon }) => ({
      group: 'პანელები',
      title: `პანელი: ${label}`,
      description: 'ფერადი ბლოკი გამოსაყოფად',
      keywords: ['panel', 'callout', variant],
      icon,
      run: (editor: Parameters<SlashItem['run']>[0], range: Parameters<SlashItem['run']>[1]) =>
        editor.chain().focus().deleteRange(range).setPanel(variant).run(),
    })),
    { group: 'ჩასმა', title: 'ციტატა', description: 'გამოყოფილი ციტატა', keywords: ['quote', 'blockquote'], icon: Quote,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleBlockquote().run() },
    { group: 'ჩასმა', title: 'კოდის ბლოკი', description: 'მონოსიგანის ტექსტი', keywords: ['code', 'pre'], icon: Code,
      run: (editor, range) => editor.chain().focus().deleteRange(range).toggleCodeBlock().run() },
    { group: 'ჩასმა', title: 'გამყოფი ხაზი', description: 'ჰორიზონტალური ხაზი', keywords: ['divider', 'hr', 'line'], icon: Minus,
      run: (editor, range) => editor.chain().focus().deleteRange(range).setHorizontalRule().run() },
  ];
}

export function filterSlashItems(items: SlashItem[], query: string): SlashItem[] {
  const q = query.trim().toLowerCase();
  if (q === '') return items;
  return items.filter((item) => item.title.toLowerCase().includes(q) || item.keywords.some((keyword) => keyword.includes(q)));
}
