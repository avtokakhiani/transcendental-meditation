import { z } from 'zod';
import definitions from './preserved-presets.json';

export const preservedDefinitions: Record<string, { name: string; functionName: string; fields: Record<string, { kind: string; label: string }>; graphs: { id: string; fields: Record<string, { kind: string; label: string }> }[] }> = definitions as unknown as typeof preservedDefinitions;
export function preservedFieldsSchema(fields: Record<string, { kind: string }>) {
  return z.strictObject(Object.fromEntries(Object.entries(fields).map(([key, field]) => [key,
    z.string().max(20000).refine(value => {
      if (field.kind === 'text') return true;
      if ([...value].some(character => character.charCodeAt(0) <= 32) || value.includes('\\')) return false;
      if (field.kind === 'image') return /^\/images\/[a-zA-Z0-9_/-]+\.(?:svg|png|jpe?g|webp|gif)$/.test(value) && !value.includes('..') || /^\/api\/media\/[0-9a-f-]{36}$/i.test(value);
      if (/^\/(?!\/)/.test(value) || /^#[a-zA-Z0-9_-]+$/.test(value)) return true;
      try { return ['https:', 'http:', 'mailto:', 'tel:'].includes(new URL(value).protocol); } catch { return false; }
    }, 'არასწორი ბმული ან სურათი'),
  ])));
}
export const preservedGraphDefinitions = Object.values(preservedDefinitions).flatMap(preset => preset.graphs);
export function isPreservedBody(body: { format: string; serialized: string }) {
  if (body.format !== 'document') return false;
  try { return JSON.parse(body.serialized).blocks?.some((block: { type: string }) => block.type === 'preserved'); } catch { return false; }
}
