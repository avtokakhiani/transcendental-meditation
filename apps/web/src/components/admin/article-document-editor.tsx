'use client';

import { useRef, useState } from 'react';
import type { ArticleDocument } from '@/lib/articles/document';
import type { ArticleInput } from '@/lib/articles/authoring';
import { articleComponentRegistry } from '@/lib/articles/component-registry';
import { visualAssets } from '@/lib/articles/visual-assets';
import { RichTextEditor } from './rich-text-editor';
import { uploadImage } from './upload-image';
import { cardClass, inputClass, labelClass, secondaryButton } from './ui';
import { PreservedArticleEditor } from './preserved-article-editor';
import { preservedGraphDefinitions } from '@/lib/articles/preserved';

type Block = ArticleDocument['blocks'][number];
type Figure = Extract<Block, { type: 'figure' }>;
type Visual = Extract<Block, { type: 'figure' | 'component' }>;
const uid = () => `b_${crypto.randomUUID()}`;
const prose = (): Extract<Block, { type: 'prose' }> => ({ type: 'prose', id: uid(), format: 'html', content: '' });
const component = (): Extract<Block, { type: 'component' }> => ({ type: 'component', id: uid(), reference: { componentId: 'research.svg', componentVersion: 1, props: { assetId: visualAssets[0].id, alt: 'სამეცნიერო კვლევის გრაფიკი' } }, summary: '', caption: '', sourceIds: [] });
export interface MediaOption { id: string; url: string; originalName: string }

function TextField({ label, value, change, type = 'text' }: { label: string; value: string | number; change: (value: string) => void; type?: string }) {
  return <label className={labelClass}>{label}<input type={type} className={inputClass} value={value} onChange={e => change(e.target.value)} /></label>;
}
function SourcesPicker({ ids, sources, change }: { ids: string[]; sources: ArticleDocument['sources']; change: (ids: string[]) => void }) {
  return <fieldset className="mt-4"><legend className={labelClass}>წყაროების მითითება</legend>{sources.length ? sources.map(source => <label className="mr-4 mt-2 inline-flex items-center gap-2 text-sm" key={source.id}><input type="checkbox" checked={ids.includes(source.id)} onChange={e => change(e.target.checked ? [...ids, source.id] : ids.filter(id => id !== source.id))} />{source.title || 'უსათაურო წყარო'}</label>) : <p className="mt-2 text-xs text-plum-500">ჯერ დაამატეთ წყარო ქვემოთ, წყაროების განყოფილებაში.</p>}</fieldset>;
}
function VisualFields({ visual, sources, change }: { visual: Visual; sources: ArticleDocument['sources']; change: (visual: Visual) => void }) {
  if (visual.type === 'figure') return <div className="space-y-4">
    <img src={visual.asset.kind === 'media' ? `/api/media/${visual.asset.mediaId}` : visual.asset.path} alt={visual.alt} className="mx-auto max-h-64 max-w-full object-contain" />
    <TextField label="ალტერნატიული ტექსტი" value={visual.alt} change={alt => change({ ...visual, alt })} />
    <div className="grid gap-4 sm:grid-cols-2"><label className={labelClass}>სურათის განლაგება<select aria-label="სურათის განლაგება" className={inputClass} value={visual.align ?? 'center'} onChange={e => change({ ...visual, align: e.target.value as Figure['align'] })}>{[['center', 'ცენტრში'], ['left', 'მარცხნივ'], ['right', 'მარჯვნივ'], ['wrap-left', 'ტექსტი მარჯვნივ'], ['wrap-right', 'ტექსტი მარცხნივ']].map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label><TextField label="სიგანე (%)" type="number" value={visual.widthPercent ?? 100} change={value => change({ ...visual, widthPercent: Number(value) })} /></div>
    <TextField label="წარწერა" value={visual.caption ?? ''} change={caption => change({ ...visual, caption })} />
    <TextField label="ავტორი / უფლებების მითითება" value={visual.attribution ?? ''} change={attribution => change({ ...visual, attribution })} />
    <TextField label="სურათის წყაროს ბმული" value={visual.sourceUrl ?? ''} change={sourceUrl => { const next = { ...visual }; if (sourceUrl) next.sourceUrl = sourceUrl; else delete next.sourceUrl; change(next); }} />
    <SourcesPicker ids={visual.sourceIds} sources={sources} change={sourceIds => change({ ...visual, sourceIds })} />
  </div>;
  const props = visual.reference.props;
  const preserved = preservedGraphDefinitions.find(graph => graph.id === visual.reference.componentId);
  const setProps = (next: typeof props) => change({ ...visual, reference: { ...visual.reference, props: next } });
  return <div className="space-y-4"><label className={labelClass}>ვიზუალური კომპონენტი<select aria-label="ვიზუალური კომპონენტი" className={inputClass} value={`${visual.reference.componentId}@${visual.reference.componentVersion}`} onChange={e => {
    const [componentId, version] = e.target.value.split('@');
    const graph = preservedGraphDefinitions.find(graph => graph.id === componentId);
    change({ ...visual, reference: { componentId: componentId!, componentVersion: Number(version), props: graph ? { fields: Object.fromEntries(Object.keys(graph.fields).map(key => [key, ''])) } : componentId === 'research.svg' ? { assetId: visualAssets[0].id, alt: '' } : { title: '', unit: '', rows: [] } } });
  }}>{articleComponentRegistry.list().map(definition => <option key={`${definition.id}@${definition.version}`} value={`${definition.id}@${definition.version}`}>{definition.label} · ვერსია {definition.version}</option>)}</select></label>
    {preserved ? <>{Object.entries(preserved.fields).map(([key, spec]) => <TextField key={key} label={spec.label} value={String((props.fields as Record<string,string>)?.[key] ?? '')} change={value => setProps({fields: {...props.fields as Record<string,string>, [key]: value}})} />)}</> : visual.reference.componentId === 'research.svg' ? <><label className={labelClass}>დამტკიცებული გრაფიკი<select className={inputClass} value={String(props.assetId)} onChange={e => setProps({ ...props, assetId: e.target.value })}>{visualAssets.map(asset => <option key={asset.id} value={asset.id}>{asset.label}</option>)}</select></label><TextField label="გრაფიკის ალტერნატიული ტექსტი" value={String(props.alt ?? '')} change={alt => setProps({ ...props, alt })} /></> : <>
      <TextField label="გრაფიკის სათაური" value={String(props.title ?? '')} change={title => setProps({ ...props, title })} /><TextField label="საზომი ერთეული" value={String(props.unit ?? '')} change={unit => setProps({ ...props, unit })} />
      {((props.rows ?? []) as { label: string; value: number }[]).map((row, index, rows) => <div key={index} className="grid grid-cols-[1fr_7rem_auto] items-end gap-2"><TextField label={`მაჩვენებელი ${index + 1}`} value={row.label} change={label => setProps({ ...props, rows: rows.map((r, i) => i === index ? { ...r, label } : r) })} /><TextField label="მნიშვნელობა" type="number" value={row.value} change={value => setProps({ ...props, rows: rows.map((r, i) => i === index ? { ...r, value: Number(value) } : r) })} /><button type="button" className="p-3 text-sm text-rose-700" aria-label={`მაჩვენებლის ${index + 1} წაშლა`} onClick={() => setProps({ ...props, rows: rows.filter((_, i) => i !== index) })}>წაშლა</button></div>)}
      <button type="button" className={secondaryButton} onClick={() => setProps({ ...props, rows: [...(props.rows as [] ?? []), { label: '', value: 0 }] })}>მაჩვენებლის დამატება</button>
    </>}
    <TextField label="ტექსტური განმარტება (ხელმისაწვდომობისთვის)" value={visual.summary} change={summary => change({ ...visual, summary })} />
    <TextField label="წარწერა" value={visual.caption ?? ''} change={caption => change({ ...visual, caption })} />
    <SourcesPicker ids={visual.sourceIds} sources={sources} change={sourceIds => change({ ...visual, sourceIds })} />
  </div>;
}

export function ArticleDocumentEditor({ body, onChange, media, protectedBody = false }: { body: ArticleInput['body']; onChange: (body: ArticleInput['body']) => void; media: MediaOption[]; protectedBody?: boolean }) {
  const file = useRef<HTMLInputElement>(null);
  const latestBody = useRef(body);
  latestBody.current = body;
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  if (protectedBody) return <div className={cardClass}><p className="text-sm leading-7">ამ გვერდის დამტკიცებული ტექსტი და სპეციალური განლაგება დაცულია. მათი რედაქტირება შესაძლებელი გახდება ცალკე მიგრაციის შემდეგ.</p></div>;
  const doc: ArticleDocument = body.format === 'document' ? JSON.parse(body.serialized) : { version: 1, blocks: [], sources: [] };
  const update = (next: ArticleDocument) => onChange({ format: 'document', serialized: JSON.stringify(next) });
  if (doc.blocks.some(block => block.type === 'preserved')) return <PreservedArticleEditor document={doc} change={update} />;
  if (body.format !== 'document') return <div className="space-y-4"><p className="text-sm text-plum-500">არსებული ტექსტი ინახება თავდაპირველ ფორმატში. დამატებითი სექციებისთვის ჩართეთ სტრუქტურირებული რედაქტორი.</p><RichTextEditor submitContent={false} name="legacy-body" defaultValue={body.serialized} defaultFormat={body.format} onChange={next => onChange({ format: next.format, serialized: next.content })} /><button type="button" className={secondaryButton} onClick={() => update({ version: 1, blocks: [{ type: 'prose', id: uid(), format: body.format, content: body.serialized }], sources: [] })}>სტრუქტურირებული რედაქტორის ჩართვა</button></div>;
  const replace = (index: number, block: Block) => update({ ...doc, blocks: doc.blocks.map((b, i) => i === index ? block : b) });
  const move = (index: number, direction: number) => { const blocks = [...doc.blocks]; const target = index + direction; if (target < 0 || target >= blocks.length) return; [blocks[index], blocks[target]] = [blocks[target]!, blocks[index]!]; update({ ...doc, blocks }); };
  const insertImage = async (url: string, alt: string) => {
    const match = /\/api\/media\/([0-9a-f-]{36})/i.exec(url); if (!match) return;
    const image = new Image(); image.src = url; await image.decode().catch(() => {});
    const figure: Figure = { type: 'figure', id: uid(), asset: { kind: 'media', mediaId: match[1]! }, alt, width: image.naturalWidth || 1200, height: image.naturalHeight || 800, align: 'center', widthPercent: 100, sourceIds: [] };
    const current: ArticleDocument = JSON.parse(latestBody.current.serialized);
    update({ ...current, blocks: [...current.blocks, figure] });
  };
  return <div className="space-y-6" data-article-document-editor>
    {doc.blocks.filter((block): block is Exclude<Block, {type: 'preserved'}> => block.type !== 'preserved').map((block, index) => <section key={block.id} data-article-block={block.type} className={`${cardClass} space-y-4`}><div className="flex flex-wrap items-center justify-between gap-3"><h2 className="font-medium text-plum-800">{index + 1}. {({ prose: 'ტექსტი', figure: 'სურათი', component: 'ვიზუალური კომპონენტი', research: 'კვლევის სექცია', citation: 'წყაროს მითითება' })[block.type]}</h2><div className="flex gap-3 text-sm"><button type="button" disabled={index === 0} onClick={() => move(index, -1)} aria-label={`სექცია ${index + 1} ზემოთ`}>↑</button><button type="button" disabled={index === doc.blocks.length - 1} onClick={() => move(index, 1)} aria-label={`სექცია ${index + 1} ქვემოთ`}>↓</button><button type="button" className="text-rose-700" onClick={() => update({ ...doc, blocks: doc.blocks.filter((_, i) => i !== index) })}>სექციის წაშლა</button></div></div>
      {block.type === 'prose' ? <RichTextEditor submitContent={false} name={`prose-${block.id}`} defaultValue={block.content} defaultFormat={block.format} minHeight="14rem" onChange={value => replace(index, { ...block, content: value.content, format: value.format })} /> : block.type === 'citation' ? <label className={labelClass}>წყარო<select className={inputClass} value={block.sourceId} onChange={e => replace(index, { ...block, sourceId: e.target.value })}>{doc.sources.map(source => <option key={source.id} value={source.id}>{source.title}</option>)}</select></label> : block.type === 'research' ? <>
        <label className={labelClass}>გრაფიკის მდებარეობა<select className={inputClass} value={block.chartSide} onChange={e => replace(index, { ...block, chartSide: e.target.value as 'left' | 'right' })}><option value="right">მარჯვნივ</option><option value="left">მარცხნივ</option></select></label>
        <RichTextEditor submitContent={false} name={`research-${block.id}`} defaultValue={block.prose.content} defaultFormat={block.prose.format} minHeight="14rem" onChange={value => replace(index, { ...block, prose: { ...block.prose, content: value.content, format: value.format } })} />
        <label className={labelClass}>კვლევის გრაფიკი<select className={inputClass} value={block.visual.type === 'figure' && block.visual.asset.kind === 'media' ? block.visual.asset.mediaId : 'component'} onChange={e => replace(index, { ...block, visual: e.target.value === 'component' ? component() : { type: 'figure', id: uid(), asset: { kind: 'media', mediaId: e.target.value }, alt: '', width: 1200, height: 800, sourceIds: [] } })}><option value="component">რეგისტრირებული კომპონენტი</option>{media.map(image => <option key={image.id} value={image.id}>{image.originalName}</option>)}</select></label><VisualFields visual={block.visual} sources={doc.sources} change={visual => replace(index, { ...block, visual })} />
      </> : <VisualFields visual={block} sources={doc.sources} change={visual => replace(index, visual)} />}
    </section>)}
    <div className={`${cardClass} flex flex-wrap gap-3`}><button type="button" className={secondaryButton} onClick={() => update({ ...doc, blocks: [...doc.blocks, prose()] })}>ტექსტის დამატება</button><button type="button" className={secondaryButton} disabled={busy} onClick={() => file.current?.click()}>{busy ? 'იტვირთება…' : 'სურათის ატვირთვა'}</button><button type="button" className={secondaryButton} onClick={() => update({ ...doc, blocks: [...doc.blocks, { type: 'research', id: uid(), chartSide: 'right', prose: prose(), visual: component() }] })}>კვლევის სექციის დამატება</button><button type="button" className={secondaryButton} onClick={() => update({ ...doc, blocks: [...doc.blocks, component()] })}>კომპონენტის დამატება</button><button type="button" className={secondaryButton} disabled={!doc.sources.length} onClick={() => update({ ...doc, blocks: [...doc.blocks, { type: 'citation', id: uid(), sourceId: doc.sources[0]!.id, label: String(doc.sources.length) }] })}>წყაროს ჩასმა</button>
      {media.length ? <label className={labelClass}>სურათი ბიბლიოთეკიდან<select className={inputClass} value="" onChange={e => { const image = media.find(item => item.id === e.target.value); if (image) void insertImage(image.url, image.originalName); }}><option value="">აირჩიეთ სურათი</option>{media.map(image => <option key={image.id} value={image.id}>{image.originalName}</option>)}</select></label> : null}
      <input ref={file} type="file" hidden accept="image/jpeg,image/png,image/webp,image/gif" onChange={async e => { const image = e.target.files?.[0]; if (!image) return; setBusy(true); setError(''); try { await insertImage(await uploadImage(image), image.name.replace(/\.[^.]+$/, '')); } catch { setError('სურათი ვერ აიტვირთა. სცადეთ ხელახლა.'); } finally { setBusy(false); } }} />
      {error ? <p role="alert" className="w-full text-sm text-rose-700">{error}</p> : null}
    </div>
    <section className={`${cardClass} space-y-5`}><h2 className="text-lg text-plum-800">წყაროები და ლიტერატურა</h2>{doc.sources.map((source, index) => <div key={source.id} className="space-y-3 border-b border-cream-300 pb-5" data-article-source><TextField label={`წყაროს ${index + 1} სათაური`} value={source.title} change={title => update({ ...doc, sources: doc.sources.map(s => s.id === source.id ? { ...s, title } : s) })} /><TextField label="წყაროს ბმული" value={source.url ?? ''} change={url => update({ ...doc, sources: doc.sources.map(s => { if (s.id !== source.id) return s; const next = { ...s }; if (url) next.url = url; else delete next.url; return next; }) })} /><TextField label="ბიბლიოგრაფიული აღწერა" value={source.citation ?? ''} change={citation => update({ ...doc, sources: doc.sources.map(s => s.id === source.id ? { ...s, citation } : s) })} /><button type="button" className="text-sm text-rose-700" onClick={() => {
      const clean = (block: Block): Block => block.type === 'research' ? { ...block, visual: { ...block.visual, sourceIds: block.visual.sourceIds.filter(id => id !== source.id) } } : 'sourceIds' in block ? { ...block, sourceIds: block.sourceIds.filter(id => id !== source.id) } : block;
      update({ ...doc, sources: doc.sources.filter(s => s.id !== source.id), blocks: doc.blocks.filter(b => b.type !== 'citation' || b.sourceId !== source.id).map(clean) });
    }}>წყაროს წაშლა და მისი მითითებების ამოღება</button></div>)}<button type="button" className={secondaryButton} onClick={() => update({ ...doc, sources: [...doc.sources, { id: uid(), title: '' }] })}>წყაროს დამატება</button></section>
  </div>;
}
