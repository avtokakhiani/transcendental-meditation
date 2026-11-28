'use client';
import {Component,useEffect,useState,type ReactNode} from 'react';
import {articleComponentRegistry,comparisonPropsSchema,type ComponentReference} from '@/lib/articles/component-registry';
import {InteractiveVisual} from '@/components/articles/interactive-visual';
import {previewArticleVisual} from '@/app/admin/(panel)/posts/visual-preview';

class PreviewBoundary extends Component<{children:ReactNode},{failed:boolean}> {
  override state={failed:false};
  static getDerivedStateFromError(){return {failed:true};}
  override render(){return this.state.failed?<p role="note">კომპონენტის პრევიუ დროებით მიუწვდომელია.</p>:this.props.children;}
}
export function ArticleVisualPreview({reference}:{reference:ComponentReference}) {
  const serialized=JSON.stringify(reference);
  const [result,setResult]=useState<{content:ReactNode;error?:string}>({content:null});
  const [pending,setPending]=useState(false);
  useEffect(()=>{
    if(JSON.parse(serialized).componentId==='research.comparison')return;
    let active=true;
    const timer=setTimeout(()=>{
      setPending(true);
      previewArticleVisual(JSON.parse(serialized)).then(value=>{if(active)setResult(value);},()=>{if(active)setResult({content:null,error:'პრევიუ ვერ ჩაიტვირთა. შეამოწმეთ ავტორიზაცია და ველები.'});}).finally(()=>{if(active)setPending(false);});
    },450);
    return ()=>{active=false;clearTimeout(timer);};
  },[serialized]);
  let preview=result;
  if(reference.componentId==='research.comparison'){
    try{const validated=articleComponentRegistry.validate(reference);preview={content:<InteractiveVisual data={comparisonPropsSchema.parse(validated.props)}/>};}
    catch{preview={content:null,error:'პრევიუსთვის შეავსეთ გრაფიკის სათაური და მაჩვენებლები.'};}
  }
  return <div data-component-preview className="min-w-0 rounded-xl border border-cream-300 bg-cream-50 p-4" aria-busy={pending}><p className="mb-3 text-xs text-plum-500">კომპონენტის წინასწარი ნახვა · საბოლოო ზომა სტატიის სრულ პრევიუში ჩანს.</p><div className="max-h-[28rem] overflow-auto">{preview.error?<p role="note" className="text-sm text-plum-500">{preview.error}</p>:<PreviewBoundary key={serialized}>{preview.content}</PreviewBoundary>}</div></div>;
}
