// One-time, deterministic extraction of approved JSX into data-driven, versioned layouts.
// Original public source files are read only. This is migration tooling, not runtime evaluation.
import ts from 'typescript';
import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import process from 'node:process';
import console from 'node:console';
const root = process.cwd();
const original = 'src/app/(site)/blog/[slug]';
const target = 'src/components/articles/presets';
await mkdir(target, { recursive: true });
const names = ['stress-article-hero', 'heart-article-hero', 'sleep-article-hero', 'what-is-tm-intro', 'what-is-tm-not', 'what-is-tm-different', 'what-is-tm-restful-alertness', 'what-is-tm-maharishi', 'what-is-tm-tony-nader'];
const definitions = {}, content = {}, files = {};
const clean = text => {
  const lines = text.split(/\r\n|\n|\r/); let result = '';
  let last = 0; lines.forEach((line, i) => { if (/[^ \t]/.test(line)) last = i; });
  lines.forEach((line, i) => { let value = line.replace(/\t/g, ' '); if (i) value = value.replace(/^ +/, ''); if (i !== lines.length - 1) value = value.replace(/ +$/, ''); if (value) result += value + (i !== last ? ' ' : ''); });
  return valueDecode(result);
};
const valueDecode = text => text.replace(/&(?:amp|lt|gt|quot|apos|nbsp|#\d+|#x[\da-f]+);/gi, entity => ({ '&amp;': '&', '&lt;': '<', '&gt;': '>', '&quot;': '"', '&apos;': "'", '&nbsp;': '\u00a0' })[entity] ?? String.fromCodePoint(entity.startsWith('&#x') ? parseInt(entity.slice(3), 16) : parseInt(entity.slice(2), 10)));
for (const name of names) {
  const source = await readFile(path.join(root, original, `${name}.tsx`), 'utf8');
  files[`${original}/${name}.tsx`] = createHash('sha256').update(source).digest('hex');
  const ast = ts.createSourceFile(`${name}.tsx`, source, ts.ScriptTarget.Latest, true, ts.ScriptKind.TSX);
  const fn = ast.statements.find(ts.isFunctionDeclaration);
  const returned = fn.body.statements.find(ts.isReturnStatement).expression;
  const preset = name.replace('-article-hero', '') + '-v1';
  const fields = {}, values = {}, graphDefinitions = [], graphs = [];
  let index = 0;
  const factory = ts.factory;
  let currentFields = fields, currentValues = values;
  const field = (value, kind, label) => {
    const key = `f${++index}`;
    currentFields[key] = { kind, label: `${label} ${index}` }; currentValues[key] = value;
    return factory.createNonNullExpression(factory.createElementAccessExpression(factory.createIdentifier('f'), factory.createStringLiteral(key)));
  };
  const transformer = context => {
    const visit = node => {
      if (ts.isJsxElement(node) && (node.openingElement.tagName.getText(ast) === 'ArticleChart' || node.openingElement.tagName.getText(ast) === 'figure') || ts.isJsxSelfClosingElement(node) && node.tagName.getText(ast) === 'ArticleChart') {
        const graphId = `preserved.${name.replace('-article-hero', '')}.graph${graphs.length + 1}`;
        const gf = {}, gv = {}, oldFields = currentFields, oldValues = currentValues;
        currentFields = gf; currentValues = gv;
        const transformed = ts.visitEachChild(node, visit, context);
        currentFields = oldFields; currentValues = oldValues;
        graphDefinitions.push({ id: graphId, fields: gf, jsx: transformed }); graphs.push({ componentId: graphId, componentVersion: 1, props: { fields: gv } });
        return factory.createJsxFragment(factory.createJsxOpeningFragment(), [factory.createJsxExpression(undefined, factory.createElementAccessExpression(factory.createIdentifier('visuals'), factory.createNumericLiteral(graphs.length - 1)))], factory.createJsxJsxClosingFragment());
      }
      if (ts.isJsxText(node) && clean(node.text)) return factory.createJsxExpression(undefined, field(clean(node.text), 'text', 'ტექსტი'));
      if (ts.isJsxAttribute(node) && node.initializer && ts.isStringLiteral(node.initializer) && ['src', 'alt', 'href', 'aria-label'].includes(node.name.getText(ast))) {
        const attr = node.name.getText(ast), value = valueDecode(node.initializer.text);
        const kind = attr === 'src' ? 'image' : attr === 'href' ? 'link' : 'text';
        return factory.updateJsxAttribute(node, node.name, factory.createJsxExpression(undefined, field(value, kind, attr === 'src' ? 'სურათი' : attr === 'href' ? 'ბმული' : attr === 'alt' ? 'ალტერნატიული ტექსტი' : 'აღწერა')));
      }
      if (ts.isJsxExpression(node) && node.expression && ['title', 'image.src', 'image.alt'].includes(node.expression.getText(ast))) {
        const key = node.expression.getText(ast);
        return factory.updateJsxExpression(node, field(`__${key}__`, key === 'image.src' ? 'image' : 'text', key === 'title' ? 'მთავარი სათაური' : 'ყდის სურათი'));
      }
      if (ts.isIdentifier(node) && node.text === 'imageUrl') return field('/images/what-is-tm-water-waves.jpeg', 'image', 'ყდის სურათი');
      // Explicit string expressions, including JSX whitespace, also belong to the snapshot.
      if (ts.isJsxExpression(node) && node.expression && ts.isStringLiteral(node.expression)) return factory.updateJsxExpression(node, field(node.expression.text, 'text', 'ტექსტი'));
      return ts.visitEachChild(node, visit, context);
    };
    return node => ts.visitNode(node, visit);
  };
  const result = ts.transform(returned, [transformer]);
  const printer = ts.createPrinter({ newLine: ts.NewLineKind.LineFeed });
  const jsx = printer.printNode(ts.EmitHint.Expression, result.transformed[0], ast);
  const imports = ast.statements.filter(ts.isImportDeclaration).filter(s => !s.importClause?.isTypeOnly).map(s => {
    const spec = s.moduleSpecifier.text;
    const resolved = spec.startsWith('.') ? '@/' + path.posix.normalize(path.posix.join(original.slice(4), spec)) : spec;
    return printer.printNode(ts.EmitHint.Unspecified, factory.updateImportDeclaration(s, s.modifiers, s.importClause, factory.createStringLiteral(resolved), s.attributes), ast);
  }).join('\n');
  const functionName = `Preset${fn.name.text}V1`;
  const graphCode = graphDefinitions.map((g, i) => `export function Graph${i + 1}({fields: f}: {fields: Record<string,string>}) { return (${printer.printNode(ts.EmitHint.Expression, g.jsx, ast)}); }`).join('\n');
  const output = `// Versioned geometry extracted from the approved original. Editorial values live in revisions.\n${imports}\nimport type { ReactNode } from 'react';\nexport function ${functionName}({fields: f${graphs.length ? ', visuals = []' : ''}}: {fields: Record<string,string>; visuals?: ReactNode[]}) { return (${jsx}); }\n${graphCode}\n`;
  assert.ok(!output.includes('__title__'));
  await writeFile(path.join(root, target, `${name}-v1.tsx`), output);
  definitions[preset] = { name, functionName, fields, graphs: graphDefinitions.map(({id,fields}) => ({id,fields})) };
  content[preset] = { fields: values, graphs };
  result.dispose();
}
await writeFile('src/lib/articles/preserved-presets.json', JSON.stringify(definitions, null, 2) + '\n');
await writeFile('scripts/article-foundation/phase4-content.json', JSON.stringify({ sourceFiles: files, presets: content }, null, 2) + '\n');
const imports = Object.entries(definitions).map(([, d], i) => `import { ${d.functionName}, ${d.graphs.map((g, n) => `Graph${n + 1} as Visual${i}_${n}`).join(', ')} } from './${d.name}-v1';`).join('\n');
const layouts = Object.entries(definitions).map(([key, d]) => `${JSON.stringify(key)}: ${d.functionName}`).join(',\n');
const visuals = Object.values(definitions).flatMap((d, i) => d.graphs.map((g, n) => `${JSON.stringify(g.id)}: Visual${i}_${n}`)).join(',\n');
await writeFile(`${target}/index.tsx`, `${imports}\nimport type { ComponentType, ReactNode } from 'react';\nimport type { ArticleDocument } from '@/lib/articles/document';\nimport { articleComponentRegistry } from '@/lib/articles/component-registry';\nconst layouts: Record<string, ComponentType<{fields: Record<string,string>; visuals?: ReactNode[]}>> = {${layouts}};\nconst graphs: Record<string, ComponentType<{fields: Record<string,string>}>> = {${visuals}};\nexport function PreservedVisual({reference}: {reference: import('@/lib/articles/component-registry').ComponentReference}) {\n try { const ref = articleComponentRegistry.validate(reference); const Visual = graphs[ref.componentId]; if (!Visual) return <p>გრაფიკი დროებით მიუწვდომელია.</p>; return <Visual fields={ref.props.fields as Record<string,string>} />; } catch { return <p>გრაფიკი დროებით მიუწვდომელია.</p>; }\n}\nexport function PreservedSection({block}: {block: Extract<ArticleDocument['blocks'][number], {type:'preserved'}>}) {const Layout = layouts[block.preset]; return Layout ? <Layout fields={block.fields} visuals={block.visuals.map((reference, index) => <PreservedVisual key={index} reference={reference}/>)} /> : <p>განლაგება დროებით მიუწვდომელია.</p>;}\n`);
console.log(`Extracted ${names.length} versioned sections without changing public sources.`);
