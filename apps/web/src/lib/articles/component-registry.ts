import { z } from 'zod';
import { visualAssets } from './visual-assets';
import { preservedGraphDefinitions, preservedFieldsSchema } from './preserved';

export const componentIdSchema = z.string().max(100).regex(/^[a-z][a-z0-9]*(?:[.-][a-z0-9]+)*$/);
export const componentReferenceSchema = z.strictObject({
  componentId: componentIdSchema,
  componentVersion: z.number().int().positive(),
  props: z.record(z.string(), z.json()),
});
export type ComponentReference = z.infer<typeof componentReferenceSchema>;

/** Data-only contract. A future renderer must explicitly map these IDs to static imports.
 * No module path, JSX, function, event handler or executable source is stored in content.
 */
export interface ComponentDefinition {
  id: string;
  version: number;
  label: string;
  propsSchema: z.ZodObject;
  accessibility: 'text-summary' | 'data-table';
}

export function createComponentRegistry(definitions: readonly ComponentDefinition[]) {
  const entries = new Map<string, Readonly<ComponentDefinition>>();
  for (const definition of definitions) {
    componentIdSchema.parse(definition.id);
    z.number().int().positive().parse(definition.version);
    const key = `${definition.id}@${definition.version}`;
    if (entries.has(key)) throw new Error(`Duplicate component version: ${key}`);
    entries.set(key, Object.freeze({ ...definition, propsSchema: definition.propsSchema.strict() }));
  }
  return Object.freeze({
    list: () => [...entries.values()],
    validate: (input: unknown): ComponentReference => {
      const reference = componentReferenceSchema.parse(input);
      const definition = entries.get(`${reference.componentId}@${reference.componentVersion}`);
      if (!definition) throw new Error('Unregistered component or version');
      // Only the schema-validated props can cross into a future React renderer.
      const props = z.record(z.string(), z.json()).parse(definition.propsSchema.parse(reference.props));
      return { ...reference, props };
    },
  });
}
export type ComponentRegistry = ReturnType<typeof createComponentRegistry>;

export const comparisonPropsSchema = z.strictObject({
  title: z.string().min(1).max(300), unit: z.string().max(50),
  rows: z.array(z.strictObject({ label: z.string().min(1).max(150), value: z.number().finite().min(-1_000_000).max(1_000_000) })).min(1).max(12),
});
export const svgPropsSchema = z.strictObject({ assetId: z.enum(visualAssets.map(asset => asset.id)), alt: z.string().min(1).max(2000) });
export const articleComponentRegistry = createComponentRegistry([
  { id: 'research.svg', version: 1, label: 'სამეცნიერო SVG გრაფიკი', propsSchema: svgPropsSchema, accessibility: 'text-summary' },
  { id: 'research.comparison', version: 1, label: 'ინტერაქტიული შედარების გრაფიკი', propsSchema: comparisonPropsSchema, accessibility: 'data-table' },
  ...preservedGraphDefinitions.map(graph => ({ id: graph.id, version: 1, label: `არსებული კვლევის გრაფიკი · ${graph.id}`, propsSchema: z.strictObject({ fields: preservedFieldsSchema(graph.fields) }), accessibility: 'text-summary' as const })),
]);
