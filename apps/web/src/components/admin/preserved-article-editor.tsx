'use client';
import type { ArticleDocument } from '@/lib/articles/document';
import { preservedDefinitions } from '@/lib/articles/preserved';
import { cardClass, inputClass, labelClass } from './ui';

type Block = Extract<ArticleDocument['blocks'][number], { type: 'preserved' }>;
const sectionLabels: Record<string, string> = { 'stress-v1': 'სტრესის შემცირება', 'heart-v1': 'გულის ჯანმრთელობა', 'sleep-v1': 'ძილის გაუმჯობესება', 'what-is-tm-intro-v1': '1. შესავალი', 'what-is-tm-not-v1': '2. რა არ არის TM', 'what-is-tm-different-v1': '3. რით განსხვავდება TM', 'what-is-tm-restful-alertness-v1': '4. ღრმა დასვენება და სიფხიზლე', 'what-is-tm-maharishi-v1': '5. მაჰარიში', 'what-is-tm-tony-nader-v1': '6. ტონი ნადერი' };
export function PreservedArticleEditor({ document, change }: { document: ArticleDocument; change: (document: ArticleDocument) => void }) {
  const replace = (id: string, next: Block) => change({ ...document, blocks: document.blocks.map(block => block.id === id ? next : block) });
  const fields = (values: Record<string, string>, specs: Record<string, { label: string; kind: string }>, update: (next: Record<string, string>) => void, prefix: string) => Object.entries(specs).map(([key, spec]) => <label key={key} className={labelClass}>{spec.label}<textarea data-preserved-field={`${prefix}.${key}`} rows={spec.kind === 'text' ? Math.min(5, Math.max(1, Math.ceil((values[key]?.length ?? 0) / 100))) : 1} className={inputClass} value={values[key]} onChange={event => update({ ...values, [key]: event.target.value })} /></label>);
  return <div className="space-y-6"><p className="rounded-2xl border border-cream-300 p-5 text-sm leading-7">დამტკიცებული განლაგება შენარჩუნებულია. ტექსტი, ბმულები, სურათები და გრაფიკის აღწერები ქვემოთ რედაქტირდება. თითოეული ველი ინარჩუნებს მის თავდაპირველ ადგილსა და ფორმატირებას. მონახაზი და შენახული ვერსია საჯარო გვერდს ჯერ არ ცვლის.</p>{document.blocks.map(block => {
    if (block.type !== 'preserved') return null;
    const spec = preservedDefinitions[block.preset]!;
    return <section key={block.id} className={`${cardClass} space-y-5`} data-preserved-section={block.preset}><h2 className="text-xl text-plum-800">{sectionLabels[block.preset]}</h2>{fields(block.fields, spec.fields, next => replace(block.id, { ...block, fields: next }), block.id)}{block.visuals.map((visual, index) => <details key={visual.componentId} className="rounded-xl border border-cream-300 p-4"><summary className="cursor-pointer text-plum-800">კვლევის გრაფიკი {index + 1} · ვერსია {visual.componentVersion}</summary><div className="mt-4 space-y-4">{fields(visual.props.fields as Record<string, string>, spec.graphs[index]!.fields, next => replace(block.id, { ...block, visuals: block.visuals.map((ref, i) => i === index ? { ...ref, props: { fields: next } } : ref) }), `${block.id}.graph${index}`)}<p className="text-xs text-plum-500">გრაფიკის ზომები, პროპორციები და ადაპტური განლაგება დაცულია რეგისტრირებული კომპონენტით.</p></div></details>)}</section>;
  })}</div>;
}
