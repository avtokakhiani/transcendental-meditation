/** Uploads through the admin API and resolves to the public URL to embed. */
export async function uploadImage(file: File): Promise<string> {
  const body = new FormData();
  body.append('file', file);
  const response = await fetch('/api/admin/media', { method: 'POST', body });
  const result = (await response.json().catch(() => ({}))) as { url?: string; error?: string };
  if (!response.ok || result.url === undefined) throw new Error(result.error ?? 'ატვირთვა ვერ მოხერხდა');
  return result.url;
}
