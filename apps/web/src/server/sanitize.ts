import sanitize from 'sanitize-html';

const COLOR = [/^#[0-9a-f]{3,8}$/i, /^rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}\s*(,\s*(0|1|0?\.\d+)\s*)?\)$/i, /^var\(--tt-[a-z0-9-]+\)$/i];
const TEXT_ALIGN = [/^(left|right|center|justify)$/];
const PERCENT = [/^\d{1,3}(\.\d+)?%$/];
const PIXELS = [/^\d{1,4}px$/];

/**
 * Allowlist for editor HTML: exactly what the rich editor can produce, nothing else. Applied when
 * content is saved and again when it is rendered, so a hand-crafted request cannot smuggle in
 * scripts, event handlers, iframes or javascript: links.
 */
const OPTIONS: sanitize.IOptions = {
  allowedTags: [
    'p', 'br', 'h1', 'h2', 'h3', 'h4', 'strong', 'b', 'em', 'i', 'u', 's', 'del', 'code', 'pre', 'blockquote',
    'ul', 'ol', 'li', 'a', 'img', 'hr', 'table', 'colgroup', 'col', 'thead', 'tbody', 'tr', 'th', 'td', 'span',
    'mark', 'div', 'label', 'input', 'sub', 'sup',
  ],
  allowedAttributes: {
    a: ['href', 'target', 'rel'],
    img: ['src', 'alt', 'title', 'data-align', 'data-width', 'style'],
    th: ['colspan', 'rowspan', 'colwidth', 'style'],
    td: ['colspan', 'rowspan', 'colwidth', 'style'],
    col: ['style'],
    table: ['style'],
    ol: ['start'],
    ul: ['data-type'],
    li: ['data-type', 'data-checked'],
    input: ['type', 'checked'],
    div: ['data-panel'],
    mark: ['style', 'data-color'],
    span: ['style'],
    p: ['style'],
    h1: ['style'],
    h2: ['style'],
    h3: ['style'],
    h4: ['style'],
  },
  allowedStyles: {
    '*': { color: COLOR, 'background-color': COLOR, 'text-align': TEXT_ALIGN },
    img: { width: PERCENT },
    col: { width: PIXELS, 'min-width': PIXELS },
    td: { width: PIXELS, 'min-width': PIXELS },
    th: { width: PIXELS, 'min-width': PIXELS },
    table: { width: PIXELS, 'min-width': PIXELS },
  },
  allowedClasses: {},
  allowedSchemes: ['http', 'https', 'mailto', 'tel'],
  allowedSchemesByTag: { img: ['http', 'https'] },
  allowProtocolRelative: false,
  allowedSchemesAppliedToAttributes: ['href', 'src'],
  transformTags: {
    a: (tagName, attribs) => {
      const href = attribs.href ?? '';
      const next: Record<string, string> = /^https?:\/\//i.test(href)
        ? { href, target: '_blank', rel: 'noopener noreferrer' }
        : { href };
      return { tagName, attribs: next };
    },
    // Task-list checkboxes are display-only on the public site.
    input: (tagName, attribs) => {
      const next: Record<string, string> =
        attribs.type === 'checkbox' ? { type: 'checkbox', disabled: '', ...(attribs.checked !== undefined ? { checked: '' } : {}) } : {};
      return { tagName, attribs: next };
    },
  },
  exclusiveFilter: (frame) =>
    (frame.tag === 'input' && frame.attribs.type !== 'checkbox') || (frame.tag === 'img' && !frame.attribs.src),
};

OPTIONS.allowedAttributes = { ...OPTIONS.allowedAttributes, input: ['type', 'checked', 'disabled'] };

export function sanitizeRichHtml(html: string): string {
  return sanitize(html, OPTIONS);
}
