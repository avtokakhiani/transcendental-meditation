/** Web links outside learnTM.ge open separately; local routes and contact links do not. */
export function isExternalLink(href: string | undefined): boolean {
  if (!href || !/^(https?:\/\/|\/\/)/i.test(href.trim())) return false;

  try {
    const url = new URL(href, 'https://learntm.ge');
    return !['learntm.ge', 'www.learntm.ge'].includes(url.hostname.toLowerCase());
  } catch {
    return false;
  }
}

export function externalLinkProps(href: string | undefined) {
  return isExternalLink(href)
    ? { target: '_blank', rel: 'noopener noreferrer' } as const
    : {};
}
