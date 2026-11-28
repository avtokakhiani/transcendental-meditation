import {articleLayoutSchema,type ArticleDocument} from './document';
import {INTRODUCTION_SLUG} from './authoring';

/** Identical rules at publication and read time; no approved layout may silently fall back. */
export function validatePublicationLayout(layoutKey:string,document:ArticleDocument|null,identity:{slug:string;kind:string}) {
  articleLayoutSchema.parse(layoutKey);
  const first=document?.blocks[0];
  if(document?.blocks.some(block=>block.type==='preserved')){
    if(first?.type!=='preserved'||layoutKey!==(first.preset==='what-is-tm-intro-v1'?'tm-introduction-v1':first.preset))throw new Error('Layout/document mismatch');
  }else if(!['standard-v1','legacy-v1'].includes(layoutKey))throw new Error('Structured dedicated layout required');
  if(identity.slug===INTRODUCTION_SLUG&&(identity.kind!=='evergreen'||layoutKey!=='tm-introduction-v1'))throw new Error('Essential introduction layout required');
  if(layoutKey==='tm-introduction-v1'&&identity.slug!==INTRODUCTION_SLUG)throw new Error('Introduction layout is reserved');
}
