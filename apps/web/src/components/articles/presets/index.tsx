import { PresetStressArticleHeroV1, Graph1 as Visual0_0, Graph2 as Visual0_1 } from './stress-article-hero-v1';
import { PresetHeartArticleHeroV1, Graph1 as Visual1_0, Graph2 as Visual1_1 } from './heart-article-hero-v1';
import { PresetSleepArticleHeroV1, Graph1 as Visual2_0 } from './sleep-article-hero-v1';
import { PresetWhatIsTmIntroV1,  } from './what-is-tm-intro-v1';
import { PresetWhatIsTmNotV1,  } from './what-is-tm-not-v1';
import { PresetWhatIsTmDifferentV1, Graph1 as Visual5_0 } from './what-is-tm-different-v1';
import { PresetWhatIsTmRestfulAlertnessV1, Graph1 as Visual6_0 } from './what-is-tm-restful-alertness-v1';
import { PresetWhatIsTmMaharishiV1,  } from './what-is-tm-maharishi-v1';
import { PresetWhatIsTmTonyNaderV1,  } from './what-is-tm-tony-nader-v1';
import type { ComponentType, ReactNode } from 'react';
import type { ArticleDocument } from '@/lib/articles/document';
import { articleComponentRegistry } from '@/lib/articles/component-registry';
const layouts: Record<string, ComponentType<{fields: Record<string,string>; visuals?: ReactNode[]}>> = {"stress-v1": PresetStressArticleHeroV1,
"heart-v1": PresetHeartArticleHeroV1,
"sleep-v1": PresetSleepArticleHeroV1,
"what-is-tm-intro-v1": PresetWhatIsTmIntroV1,
"what-is-tm-not-v1": PresetWhatIsTmNotV1,
"what-is-tm-different-v1": PresetWhatIsTmDifferentV1,
"what-is-tm-restful-alertness-v1": PresetWhatIsTmRestfulAlertnessV1,
"what-is-tm-maharishi-v1": PresetWhatIsTmMaharishiV1,
"what-is-tm-tony-nader-v1": PresetWhatIsTmTonyNaderV1};
const graphs: Record<string, ComponentType<{fields: Record<string,string>}>> = {"preserved.stress.graph1": Visual0_0,
"preserved.stress.graph2": Visual0_1,
"preserved.heart.graph1": Visual1_0,
"preserved.heart.graph2": Visual1_1,
"preserved.sleep.graph1": Visual2_0,
"preserved.what-is-tm-different.graph1": Visual5_0,
"preserved.what-is-tm-restful-alertness.graph1": Visual6_0};
export function PreservedVisual({reference}: {reference: import('@/lib/articles/component-registry').ComponentReference}) {
 try { const ref = articleComponentRegistry.validate(reference); const Visual = graphs[ref.componentId]; if (!Visual) return <p>გრაფიკი დროებით მიუწვდომელია.</p>; return <Visual fields={ref.props.fields as Record<string,string>} />; } catch { return <p>გრაფიკი დროებით მიუწვდომელია.</p>; }
}
export function PreservedSection({block}: {block: Extract<ArticleDocument['blocks'][number], {type:'preserved'}>}) {const Layout = layouts[block.preset]; return Layout ? <Layout fields={block.fields} visuals={block.visuals.map((reference, index) => <PreservedVisual key={index} reference={reference}/>)} /> : <p>განლაგება დროებით მიუწვდომელია.</p>;}
