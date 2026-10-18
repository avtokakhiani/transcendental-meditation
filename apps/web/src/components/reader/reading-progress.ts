const key = (slug: string) => `tm:reading:${slug}`;

/** Last page per book lives only in this browser; readers have no accounts. */
export function loadLastPage(slug: string): number | null {
  try {
    const value = Number.parseInt(localStorage.getItem(key(slug)) ?? '', 10);
    return Number.isFinite(value) && value > 0 ? value : null;
  } catch {
    return null;
  }
}

export function saveLastPage(slug: string, page: number): void {
  try {
    localStorage.setItem(key(slug), String(page));
  } catch {
    // Private mode or blocked storage: progress just is not remembered.
  }
}
