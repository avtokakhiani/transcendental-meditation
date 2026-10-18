import { Extension, Node, type Range } from '@tiptap/core';
import type { Editor } from '@tiptap/core';
import Image from '@tiptap/extension-image';
import { ReactNodeViewRenderer } from '@tiptap/react';
import Suggestion, { type SuggestionKeyDownProps, type SuggestionProps } from '@tiptap/suggestion';
import { ImageView } from './image-view';

// ---------- Image: percentage width + alignment / text wrap ----------

export const IMAGE_ALIGNS = ['center', 'left', 'right', 'wrap-left', 'wrap-right'] as const;
export type ImageAlign = (typeof IMAGE_ALIGNS)[number];

/**
 * Width is a percentage of the text column, not pixels, so an image keeps its proportion between
 * the editor, the blog column and every reader width setting.
 */
export const RichImage = Image.extend({
  addAttributes() {
    return {
      ...this.parent?.(),
      width: {
        default: null,
        parseHTML: (element) => {
          const match = /([\d.]+)%/.exec(element.style.width);
          return match ? Math.min(100, Math.max(10, Number(match[1]))) : null;
        },
        renderHTML: (attributes) => (attributes.width ? { style: `width: ${attributes.width}%` } : {}),
      },
      height: { default: null, rendered: false },
      align: {
        default: 'center',
        parseHTML: (element) => {
          const value = element.getAttribute('data-align');
          return (IMAGE_ALIGNS as readonly string[]).includes(value ?? '') ? value : 'center';
        },
        renderHTML: (attributes) => ({ 'data-align': attributes.align }),
      },
    };
  },
  addNodeView() {
    return ReactNodeViewRenderer(ImageView);
  },
}).configure({ inline: false, allowBase64: false, resize: false });

// ---------- Panel (Jira-style info / note / success / warning / error) ----------

export const PANEL_VARIANTS = ['info', 'note', 'success', 'warning', 'error'] as const;
export type PanelVariant = (typeof PANEL_VARIANTS)[number];

declare module '@tiptap/core' {
  interface Commands<ReturnType> {
    panel: {
      setPanel: (variant: PanelVariant) => ReturnType;
      unsetPanel: () => ReturnType;
    };
  }
}

export const Panel = Node.create({
  name: 'panel',
  group: 'block',
  content: 'block+',
  defining: true,

  addAttributes() {
    return {
      variant: {
        default: 'info',
        parseHTML: (element) => element.getAttribute('data-panel') ?? 'info',
        renderHTML: (attributes) => ({ 'data-panel': attributes.variant }),
      },
    };
  },

  parseHTML() {
    return [{ tag: 'div[data-panel]' }];
  },

  renderHTML({ HTMLAttributes }) {
    return ['div', HTMLAttributes, 0];
  },

  addCommands() {
    return {
      setPanel:
        (variant) =>
        ({ editor, commands }) =>
          editor.isActive('panel') ? commands.updateAttributes('panel', { variant }) : commands.wrapIn(this.name, { variant }),
      unsetPanel:
        () =>
        ({ commands }) =>
          commands.lift(this.name),
    };
  },
});

// ---------- Slash command ("/" menu) ----------

export interface SlashItem {
  title: string;
  description: string;
  keywords: string[];
  group: string;
  icon: React.ComponentType<{ className?: string; 'aria-hidden'?: boolean | 'true' }>;
  run: (editor: Editor, range: Range) => void;
}

/** The React component owns the menu UI; the plugin talks to it through this mutable bridge. */
export interface SlashBridge {
  items: (query: string) => SlashItem[];
  onOpen: (props: SuggestionProps<SlashItem>) => void;
  onUpdate: (props: SuggestionProps<SlashItem>) => void;
  onKeyDown: (props: SuggestionKeyDownProps) => boolean;
  onClose: () => void;
}

export const SlashCommand = Extension.create<{ bridge: { current: SlashBridge | null } }>({
  name: 'slashCommand',

  addOptions() {
    return { bridge: { current: null } };
  },

  addProseMirrorPlugins() {
    const bridge = this.options.bridge;
    return [
      Suggestion<SlashItem>({
        editor: this.editor,
        char: '/',
        allowSpaces: false,
        startOfLine: false,
        items: ({ query }) => bridge.current?.items(query) ?? [],
        command: ({ editor, range, props }) => props.run(editor, range),
        render: () => ({
          onStart: (props) => bridge.current?.onOpen(props),
          onUpdate: (props) => bridge.current?.onUpdate(props),
          onKeyDown: (props) => bridge.current?.onKeyDown(props) ?? false,
          onExit: () => bridge.current?.onClose(),
        }),
      }),
    ];
  },
});
