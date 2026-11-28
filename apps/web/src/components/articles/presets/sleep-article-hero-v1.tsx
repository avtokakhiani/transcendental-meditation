// Versioned geometry extracted from the approved original. Editorial values live in revisions.
import { ArticleContent, ArticleText, ArticleResearch, ArticleChart, ArticleCta, } from "@/components/article-layout";
import Image from "next/image";
import hero from "@/app/(site)/stress-and-anxiety/stress-and-anxiety.module.css";
import overlay from "@/app/(site)/blog/articles-hero.module.css";
import { ArticlesHeaderBackground } from "@/app/(site)/blog/articles-header-background";
import styles from "@/app/(site)/blog/[slug]/sleep-article-hero.module.css";
import type { ReactNode } from 'react';
export function PresetSleepArticleHeroV1({fields: f, visuals = []}: {fields: Record<string,string>; visuals?: ReactNode[]}) { return ((<article>
      <ArticlesHeaderBackground />
      <section aria-labelledby="sleep-article-heading" className={`${hero.hero} ${overlay.hero} ${styles.hero}`}>
        <Image src={f["f1"]!} alt={f["f2"]!} fill preload quality={90} sizes="100vw" className={`${hero.photograph} ${styles.photograph}`}/>
        <h1 id="sleep-article-heading" className={hero.heading}>
          {f["f3"]!}
        </h1>
      </section>
      <ArticleContent variant="sleep">
        <ArticleText>
          <p>{f["f4"]!}</p>
          <p>{f["f5"]!}<strong>{f["f6"]!}</strong>{f["f7"]!}</p>
          <p>{f["f8"]!}<strong>{f["f9"]!}</strong>{f["f10"]!}<strong>{f["f11"]!}</strong>{f["f12"]!}</p>
          <p>{f["f13"]!}<strong>{f["f14"]!}</strong>{f["f15"]!}</p>
          <p>{f["f16"]!}<strong>{f["f17"]!}</strong>{f["f18"]!}</p>
          <p>{f["f19"]!}</p>
          <h2>{f["f20"]!}</h2>
          <p>{f["f21"]!}<strong>{f["f22"]!}</strong>{f["f23"]!}</p>
          <p>{f["f24"]!}</p>
          <p>{f["f25"]!}<strong>{f["f26"]!}</strong>{f["f27"]!}</p>
          <p>{f["f28"]!}<strong>{f["f29"]!}</strong>{f["f30"]!}</p>
          <p>{f["f31"]!}</p>
          <p>{f["f32"]!}</p>
          <p>{f["f33"]!}</p>
          <p>{f["f34"]!}<strong>{f["f35"]!}</strong>{f["f36"]!}</p>
          <h2>{f["f37"]!}</h2>
          <p><strong>{f["f38"]!}</strong></p>
          <p>{f["f39"]!}</p>
          <p>{f["f40"]!}</p>
          <p>{f["f41"]!}<strong>{f["f42"]!}</strong>{f["f43"]!}</p>
          <h2>{f["f44"]!}</h2>
          <p>{f["f45"]!}<strong>{f["f46"]!}</strong>{f["f47"]!}<strong>{f["f48"]!}</strong>{f["f49"]!}</p>
          <p>{f["f50"]!}<strong>{f["f51"]!}</strong>{f["f52"]!}</p>
          <p>{f["f53"]!}<strong>{f["f54"]!}</strong>{f["f55"]!}</p>
          <p>{f["f56"]!}<strong>{f["f57"]!}</strong>{f["f58"]!}</p>
        </ArticleText>
        <ArticleResearch chart={<>{visuals[0]}</>}>
          <h2>{f["f61"]!}</h2>
          <p>{f["f62"]!}<strong>{f["f63"]!}</strong>{f["f64"]!}</p>
          <p>{f["f65"]!}</p>
        </ArticleResearch>
        <ArticleText separated>
          <h2>{f["f66"]!}</h2>
          <p>{f["f67"]!}</p>
          <p>{f["f68"]!}</p>
          <p>{f["f69"]!}</p>
          <p>{f["f70"]!}</p>
          <p>{f["f71"]!}</p>
          <p><strong>{f["f72"]!}</strong>{f["f73"]!}</p>
          <p>{f["f74"]!}</p>
        </ArticleText>
      </ArticleContent>
      <ArticleCta headingId="sleep-teacher-heading"/>
    </article>)); }
export function Graph1({fields: f}: {fields: Record<string,string>}) { return (<ArticleChart figureClassName={styles.insomniaFigure} src={f["f59"]!} alt={f["f60"]!} width={2339} height={1539} className={styles.insomniaChart} loading="lazy"/>); }
