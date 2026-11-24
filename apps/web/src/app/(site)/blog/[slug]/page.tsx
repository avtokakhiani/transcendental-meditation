import {notFound,permanentRedirect} from 'next/navigation';
import {headers} from 'next/headers';
import {preload} from 'react-dom';
import {publicArticle} from '@/server/public-articles';
import {publishedArticleMetadata} from '@/server/article-metadata';
import {RevisionArticle} from '@/components/articles/document-renderer';
import {INTRODUCTION_SLUG} from '@/lib/articles/authoring';
export const dynamic='force-dynamic';
type Props={params:Promise<{slug:string}>};
export async function generateMetadata(props:Props) {

  const {slug}=await props.params,article=await publicArticle(slug);
  if(!article)return {};
  const metadata=publishedArticleMetadata(article);
  if(!JSON.parse(article.revision.presentation??'{}').legacyMetadata){const host=(await headers()).get('host');if(host&&/^(localhost|127\.0\.0\.1):\d+$/.test(host))metadata.metadataBase=new URL('http://'+host);}
  return metadata;
}
export default async function ArticlePage(props:Props){

  const {slug}=await props.params,article=await publicArticle(slug);
  if(!article)notFound();
  if(article.isAlias)permanentRedirect('/blog/'+article.canonicalSlug);
  if(article.slug===INTRODUCTION_SLUG){const first=article.document?.blocks[0];const image=first?.type==='preserved'?first.fields.f1:null;if(image)preload(image,{as:'image',fetchPriority:'high'});}
  return <RevisionArticle revision={article.revision}/>;
}
