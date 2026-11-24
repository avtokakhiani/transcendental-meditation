'use server';
import type {ReactNode} from 'react';
import {requireUser} from '@/server/auth';
import {articleComponentRegistry,svgPropsSchema} from '@/lib/articles/component-registry';
import {visualAssets} from '@/lib/articles/visual-assets';
import {PreservedVisual} from '@/components/articles/presets';

/** Authenticated read-only server rendering: no draft props enter URLs or shared caches. */
export async function previewArticleVisual(input:unknown):Promise<{content:ReactNode;error?:string}> {
  await requireUser();
  try {
    if(JSON.stringify(input).length>100_000)throw new Error('Preview limit');
    const reference=articleComponentRegistry.validate(input);
    if(reference.componentId==='research.svg'){
      const props=svgPropsSchema.parse(reference.props),asset=visualAssets.find(item=>item.id===props.assetId)!;
      return {content:<img src={asset.path} alt={props.alt} width={asset.width} height={asset.height} className="mx-auto max-h-80 max-w-full object-contain"/>};
    }
    if(reference.componentId.startsWith('preserved.'))return {content:<PreservedVisual reference={reference}/>};
    throw new Error('Unavailable visual');
  }catch{return {content:null,error:'პრევიუსთვის შეავსეთ კომპონენტის სავალდებულო ველები. სტატიის დანარჩენი შინაარსი უცვლელია.'};}
}
