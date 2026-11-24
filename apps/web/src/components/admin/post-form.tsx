'use client';
import { useActionState, useState } from 'react';
import Link from 'next/link';
import { useFormStatus } from 'react-dom';
import { isPreservedBody } from '@/lib/articles/preserved';
import type { ArticleInput } from '@/lib/articles/authoring';
import { savePostAction } from '@/app/admin/(panel)/posts/actions';
import { ArticleDocumentEditor, type MediaOption } from './article-document-editor';
import { CoverField } from './cover-field';
import { FormMessages } from './form-feedback';
import { TitleSlugFields } from './title-slug-fields';
import { cardClass, inputClass, labelClass, primaryButton, secondaryButton } from './ui';

export interface ArticleEditorContext {
  id: string; version: number; legacyToken: string; status: string; protectedPage: boolean; diverged: boolean;
  draftRevisionId: string | null; publishedRevisionId: string | null;
  revisions: { id: string; number: number; title: string; createdAt: string }[];
}
const EMPTY: ArticleInput = { title: '', slug: '', displayHeading: null, cardTitle: null, excerpt: null, cardExcerpt: null,
  editorialByline: null, category: null, coverImageUrl: null, coverImageAlt: null, coverCrop: 'center', seoTitle: null, seoDescription: null, layoutKey: 'standard-v1',
  body: { format: 'document', serialized: JSON.stringify({ version: 1, blocks: [{ type: 'prose', id: 'opening', content: '', format: 'html' }], sources: [] }) },
};
function revisionDate(value: string) {
  // Modern editorial timestamps use Tbilisi UTC+4; do not depend on varying Georgian ICU data.
  const date = new Date(Date.parse(value) + 4 * 60 * 60 * 1000);
  const pad = (number: number) => String(number).padStart(2, '0');
  return `${pad(date.getUTCDate())}.${pad(date.getUTCMonth() + 1)}.${date.getUTCFullYear()}, ${pad(date.getUTCHours())}:${pad(date.getUTCMinutes())}`;
}
function ActionButton({ intent, children, disabled, confirmation }: { intent: string; children: React.ReactNode; disabled?: boolean; confirmation?: string }) {
  const { pending } = useFormStatus();
  return <button type="submit" name="intent" value={intent} disabled={disabled || pending} className={intent === 'publish' ? primaryButton : secondaryButton} onClick={e => { if (confirmation && !confirm(confirmation)) e.preventDefault(); }}>{pending ? 'მუშავდება…' : children}</button>;
}
export function PostForm({ initial = EMPTY, context, media = [], saved }: { initial?: ArticleInput; context?: ArticleEditorContext; media?: MediaOption[]; saved?: boolean }) {
  const [state, action] = useActionState(savePostAction, { error: null });
  const [fields, setFields] = useState(initial);
  const [historical, setHistorical] = useState('');
  const migrated = isPreservedBody(initial.body);
  const protectedPage = context?.protectedPage ?? false;
  const field = (name: Exclude<keyof ArticleInput, 'body' | 'coverCrop' | 'layoutKey' | 'coverImageUrl' | 'slug'>, label: string, multiline = false) => <label className={labelClass}>{label}{multiline ? <textarea name={name} rows={3} className={inputClass} value={fields[name] ?? ''} onChange={e => setFields({ ...fields, [name]: e.target.value })} /> : <input name={name} className={inputClass} value={fields[name] ?? ''} onChange={e => setFields({ ...fields, [name]: e.target.value })} />}</label>;
  return <form action={action} className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_21rem]" data-article-authoring>
    <input type="hidden" name="id" value={context?.id ?? ''} /><input type="hidden" name="version" value={context?.version ?? 0} /><input type="hidden" name="legacyToken" value={context?.legacyToken ?? ''} />
    <input type="hidden" name="bodyFormat" value={fields.body.format} /><input type="hidden" name="body" value={fields.body.serialized} />
    <div className="min-w-0 space-y-6"><FormMessages state={state} saved={saved} />
      {context?.diverged ? <div role="alert" className="rounded-xl bg-amber-50 p-5 text-sm leading-7">ძველ მონაცემებში გარე ცვლილება აღმოჩნდა. მიმდინარე საჯარო ტექსტი დაცულია. შეაჯერეთ ვერსიები გაგრძელებამდე.<div className="mt-3"><ActionButton intent="reconcile">გარე ცვლილებების შეჯერება</ActionButton></div></div> : null}
      <section className={`${cardClass} space-y-5`}><h2 className="text-lg text-plum-800">სტატიის ძირითადი ინფორმაცია</h2>{context ? <>{field('title', 'სტატიის სათაური')}<label className={labelClass}>მისამართი (უცვლელი)<input name="slug" readOnly className={inputClass} value={initial.slug} /></label></> : <TitleSlugFields defaultTitle={initial.title} defaultSlug={initial.slug} urlPrefix="/blog/" />}
        {field('displayHeading', 'გვერდზე გამოსაჩენი სათაური (არასავალდებულო)')}<div className="grid gap-5 sm:grid-cols-2">{field('editorialByline', 'სტატიის ავტორი')}{field('category', 'კატეგორია')}</div>{field('excerpt', 'მოკლე აღწერა', true)}
      </section><ArticleDocumentEditor body={fields.body} onChange={body => setFields(current => ({ ...current, body }))} media={media} protectedBody={protectedPage} />
    </div><aside className="min-w-0 space-y-6"><section className={`${cardClass} space-y-4`}><h2 className="text-lg text-plum-800">შენახვა და გამოქვეყნება</h2><p className="text-sm leading-6 text-plum-500">{context?.status === 'published' ? 'სტატია გამოქვეყნებულია. მონახაზის შენახვა საჯარო ვერსიას არ ცვლის.' : 'მონახაზი მხოლოდ ავტორიზებული რედაქტორებისთვისაა ხელმისაწვდომი.'}</p>
      <div className="flex flex-wrap gap-3"><ActionButton intent="save" disabled={context?.diverged}>მონახაზის შენახვა</ActionButton><ActionButton intent="publish" disabled={protectedPage || context?.diverged} confirmation={migrated ? 'დავამტკიცოთ ვერსია? საჯარო გვერდი ამ ეტაპზე უცვლელი დარჩება.' : 'გამოვაქვეყნოთ სტატიის ეს ვერსია?'}>{migrated ? 'ვერსიის დამტკიცება' : 'გამოქვეყნება'}</ActionButton></div>
      {migrated ? <p className="text-xs leading-6 text-plum-500">მიგრირებული სტატიის დამტკიცებული ვერსია ინახება ბაზაში. საჯარო გვერდზე ცვლილებების გამოჩენა ცალკე ეტაპზე ჩაირთვება.</p> : null}
      {context?.draftRevisionId ? <Link href={`/admin/posts/${context.id}/preview` as never} prefetch={false} target="_blank" className={`${secondaryButton} w-full`}>შენახული მონახაზის წინასწარი ნახვა</Link> : <p className="text-xs leading-6 text-plum-500">წინასწარი ნახვისთვის ჯერ შეინახეთ მონახაზი.</p>}
      {context?.status === 'published' ? <ActionButton intent="unpublish" disabled={protectedPage || migrated || context.diverged} confirmation="მოვხსნათ სტატია საჯარო გვერდიდან? პირველი გამოქვეყნების თარიღი შენარჩუნდება.">გამოქვეყნების გაუქმება</ActionButton> : null}
      {protectedPage ? <p className="text-xs leading-6 text-plum-500">„რა არის TM?“ გვერდის საჯარო ცვლილებები ცალკე მიგრაციამდე შეჩერებულია. მეტამონაცემების მონახაზი შეგიძლიათ შეინახოთ.</p> : null}
    </section><section className={`${cardClass} space-y-4`}><h2 className="text-lg text-plum-800">ყდის სურათი</h2><CoverField defaultValue={initial.coverImageUrl ?? ''} />{field('coverImageAlt', 'ყდის ალტერნატიული ტექსტი')}<label className={labelClass}>ყდის მოჭრის პრესეტი<select name="coverCrop" className={inputClass} value={fields.coverCrop} onChange={e => setFields({ ...fields, coverCrop: e.target.value as ArticleInput['coverCrop'] })}><option value="center">ცენტრი</option><option value="top">ზედა ნაწილი</option><option value="bottom">ქვედა ნაწილი</option></select></label></section>
      <section className={`${cardClass} space-y-4`}><h2 className="text-lg text-plum-800">ბარათის ტექსტი</h2>{field('cardTitle', 'ბარათის სათაური (არასავალდებულო)')}{field('cardExcerpt', 'ბარათის აღწერა (არასავალდებულო)', true)}</section>
      <section className={`${cardClass} space-y-4`}><h2 className="text-lg text-plum-800">საძიებო სისტემები</h2>{field('seoTitle', 'SEO სათაური')}{field('seoDescription', 'SEO აღწერა', true)}</section>
      <section className={`${cardClass} space-y-4`}><label className={labelClass}>სტატიის განლაგება<select name="layoutKey" className={inputClass} value={fields.layoutKey} onChange={e => setFields({ ...fields, layoutKey: e.target.value as ArticleInput['layoutKey'] })}>{migrated ? <option value={initial.layoutKey}>დამტკიცებული განლაგება · {initial.layoutKey}</option> : protectedPage ? <option value="tm-introduction-v1">„რა არის TM?“ — დაცული განლაგება</option> : <><option value="standard-v1">სტანდარტული სტატია</option><option value="legacy-v1">არსებული კლასიკური განლაგება</option></>}</select></label><p className="text-xs leading-6 text-plum-500">საჯარო გვერდები ჯერ არსებულ რენდერერს იყენებს. ახალი ბარათის, SEO და განლაგების პარამეტრები ინახება შემდგომი ეტაპისთვის. ინტერაქტიული კომპონენტები სრულად ჩანს კერძო წინასწარ ნახვაში.</p></section>
      {context ? <section className={`${cardClass} space-y-4`}><h2 className="text-lg text-plum-800">ვერსიების ისტორია</h2><label className={labelClass}>შენახული ვერსია<select name="revisionId" className={inputClass} value={historical} onChange={e => setHistorical(e.target.value)}><option value="">აირჩიეთ ვერსია</option>{context.revisions.map(revision => <option key={revision.id} value={revision.id}>#{revision.number} · {revisionDate(revision.createdAt)}{revision.id === context.publishedRevisionId ? migrated ? ' · დამტკიცებული' : ' · საჯარო' : ''}{revision.id === context.draftRevisionId ? ' · მონახაზი' : ''}</option>)}</select></label>{historical ? <Link href={`/admin/posts/${context.id}/preview?revision=${historical}` as never} prefetch={false} target="_blank" className="block text-sm underline">არჩეული ვერსიის ნახვა</Link> : null}<ActionButton intent="restore" disabled={!historical || protectedPage || context.diverged} confirmation="აღვადგინოთ არჩეული ვერსია ახალ მონახაზად? საჯარო ვერსია არ შეიცვლება.">ვერსიის მონახაზად აღდგენა</ActionButton></section> : null}
    </aside></form>;
}
