'use client';

import { useEffect, type RefObject } from 'react';

/** A deterrent for ordinary browser actions, not DRM; the readable DOM stays intact. */
export function useBookContentProtection(root: RefObject<HTMLElement | null>) {
  useEffect(() => {
    const container = root.current;
    if (!container) return;

    const elementFor = (target: EventTarget | null) => target instanceof Element
      ? target : target instanceof Node ? target.parentElement : null;
    const editable = (target: EventTarget | null) => {
      const element = elementFor(target);
      return Boolean(element?.closest('input, textarea, select, [role="textbox"]'))
        || (element instanceof HTMLElement && element.isContentEditable);
    };
    const protectedTarget = (target: EventTarget | null) => {
      const element = elementFor(target);
      return element !== null && container.contains(element) && element.closest('[data-book-content]') !== null;
    };
    const protectedSelection = (selection: Selection) => {
      for (let index = 0; index < selection.rangeCount; index += 1) {
        const range = selection.getRangeAt(index);
        if (range.collapsed) continue;
        for (const chapter of container.querySelectorAll('[data-book-content]')) {
          if (range.intersectsNode(chapter)) return true;
        }
      }
      return false;
    };
    const applies = (target: EventTarget | null) => {
      if (editable(target)) return false;
      const selection = window.getSelection();
      // Copy can target document.body after Select All, rather than the chapter.
      // Conversely, a selection wholly outside the chapters remains unrestricted.
      return selection && !selection.isCollapsed ? protectedSelection(selection) : protectedTarget(target);
    };
    const clipboard = (event: ClipboardEvent) => {
      if (applies(event.target)) event.preventDefault();
    };
    const keydown = (event: KeyboardEvent) => {
      const key = event.key.toLowerCase();
      const copyOrCut = !event.altKey && (
        ((event.ctrlKey || event.metaKey) && !event.shiftKey && (key === 'c' || key === 'x'))
        || (event.ctrlKey && !event.metaKey && !event.shiftKey && key === 'insert')
        || (event.shiftKey && !event.ctrlKey && !event.metaKey && key === 'delete')
      );
      if (copyOrCut && applies(event.target)) event.preventDefault();
    };
    const contentAction = (event: Event) => {
      if (!editable(event.target) && protectedTarget(event.target)) event.preventDefault();
    };

    document.addEventListener('copy', clipboard, true);
    document.addEventListener('cut', clipboard, true);
    document.addEventListener('keydown', keydown, true);
    container.addEventListener('contextmenu', contentAction, true);
    container.addEventListener('dragstart', contentAction, true);
    return () => {
      document.removeEventListener('copy', clipboard, true);
      document.removeEventListener('cut', clipboard, true);
      document.removeEventListener('keydown', keydown, true);
      container.removeEventListener('contextmenu', contentAction, true);
      container.removeEventListener('dragstart', contentAction, true);
    };
  }, [root]);
}
