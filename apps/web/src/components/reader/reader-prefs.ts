export const READER_THEMES = ['light', 'sepia', 'dark'] as const;
export type ReaderTheme = (typeof READER_THEMES)[number];

export const MIN_SIZE = 0;
export const MAX_SIZE = 4;
/** Page sheet width steps; the rem values live in globals.css under data-reader-width. The last step fills the screen. */
export const MIN_WIDTH = 0;
export const MAX_WIDTH = 5;

export interface ReaderPrefs {
  theme: ReaderTheme;
  size: number;
  width: number;
  /** Desktop sidebar only; on phones the table of contents is a drawer that starts closed. */
  tocOpen: boolean;
}

export const DEFAULT_PREFS: ReaderPrefs = { theme: 'light', size: 2, width: 2, tocOpen: true };

const STORAGE_KEY = 'tm:reader-prefs';

/**
 * Runs inline before the reader paints so a saved theme or hidden sidebar never flashes first.
 * Kept as a string because it executes ahead of hydration.
 */
export const PREFS_BOOT_SCRIPT = `try{var p=JSON.parse(localStorage.getItem('${STORAGE_KEY}')||'{}');var r=document.currentScript.parentElement;if(['light','sepia','dark'].indexOf(p.theme)>-1)r.dataset.readerTheme=p.theme;if(p.size>=${MIN_SIZE}&&p.size<=${MAX_SIZE})r.dataset.readerSize=String(p.size);if(p.width>=${MIN_WIDTH}&&p.width<=${MAX_WIDTH})r.dataset.readerWidth=String(p.width);if(p.tocOpen===false)r.dataset.readerToc='closed'}catch(e){}`;

export function loadPrefs(): ReaderPrefs {
  try {
    const parsed = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}') as Partial<Record<keyof ReaderPrefs, unknown>>;
    return {
      theme: (READER_THEMES as readonly unknown[]).includes(parsed.theme) ? (parsed.theme as ReaderTheme) : DEFAULT_PREFS.theme,
      size:
        typeof parsed.size === 'number' && parsed.size >= MIN_SIZE && parsed.size <= MAX_SIZE ? parsed.size : DEFAULT_PREFS.size,
      width:
        typeof parsed.width === 'number' && parsed.width >= MIN_WIDTH && parsed.width <= MAX_WIDTH
          ? parsed.width
          : DEFAULT_PREFS.width,
      tocOpen: parsed.tocOpen !== false,
    };
  } catch {
    return DEFAULT_PREFS;
  }
}

export function savePrefs(prefs: ReaderPrefs): void {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(prefs));
  } catch {
    // Storage blocked: preferences last for this page view only.
  }
}
