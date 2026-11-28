// Versioned geometry extracted from the approved original. Editorial values live in revisions.
import { ArticleContent, ArticleText, ArticleResearch, ArticleChart, ArticleCta, } from "@/components/article-layout";
import Image from "next/image";
import hero from "@/app/(site)/stress-and-anxiety/stress-and-anxiety.module.css";
import overlay from "@/app/(site)/blog/articles-hero.module.css";
import { ArticlesHeaderBackground } from "@/app/(site)/blog/articles-header-background";
import styles from "@/app/(site)/blog/[slug]/heart-article-hero.module.css";
import type { ReactNode } from 'react';
export function PresetHeartArticleHeroV1({fields: f, visuals = []}: {fields: Record<string,string>; visuals?: ReactNode[]}) { return ((<article>
      <ArticlesHeaderBackground />
      <section aria-labelledby="heart-article-heading" className={`${hero.hero} ${overlay.hero} ${styles.hero}`}>
        <Image src={f["f1"]!} alt={f["f2"]!} fill preload quality={90} sizes="100vw" className={`${hero.photograph} ${styles.photograph}`}/>
        <h1 id="heart-article-heading" className={hero.heading}>
          {f["f3"]!}
        </h1>
      </section>
      <ArticleContent>
        <ArticleText>
          <p>{f["f4"]!}</p>
          <h2>{f["f5"]!}</h2>
          <p>{f["f6"]!}<strong>{f["f7"]!}</strong>{f["f8"]!}<strong>{f["f9"]!}</strong>{f["f10"]!}</p>
          <p>{f["f11"]!}<strong>{f["f12"]!}</strong>{f["f13"]!}</p>
          <ul>
            <li>{f["f14"]!}</li>
            <li>{f["f15"]!}</li>
            <li>{f["f16"]!}</li>
            <li>{f["f17"]!}</li>
            <li>{f["f18"]!}</li>
            <li>{f["f19"]!}</li>
          </ul>
          <h2>{f["f20"]!}</h2>
          <p>{f["f21"]!}<strong>{f["f22"]!}</strong>{f["f23"]!}</p>
          <p>{f["f24"]!}</p>
        </ArticleText>
        <ArticleResearch chart={<>{visuals[0]}</>}>
          <p>{f["f27"]!}<strong>{f["f28"]!}</strong>{f["f29"]!}</p>
        </ArticleResearch>
        <ArticleText separated>
          <h2>{f["f30"]!}</h2>
          <p>{f["f31"]!}<strong>{f["f32"]!}</strong></p>
          <p>{f["f33"]!}<strong>{f["f34"]!}</strong>{f["f35"]!}</p>
          <p>{f["f36"]!}<strong>{f["f37"]!}</strong>{f["f38"]!}</p>
          <ul>
            <li>{f["f39"]!}</li>
            <li>{f["f40"]!}</li>
            <li>{f["f41"]!}</li>
            <li>{f["f42"]!}</li>
            <li>{f["f43"]!}</li>
            <li>{f["f44"]!}</li>
          </ul>
        </ArticleText>
        <ArticleResearch chart={<>{visuals[1]}</>}>
          <h2>{f["f47"]!}</h2>
          <p>{f["f48"]!}<strong>{f["f49"]!}</strong>{f["f50"]!}</p>
          <p>{f["f51"]!}<strong>{f["f52"]!}</strong>{f["f53"]!}</p>
          <p>{f["f54"]!}<strong>{f["f55"]!}</strong>{f["f56"]!}</p>
        </ArticleResearch>
      </ArticleContent>
      <ArticleCta headingId="heart-teacher-heading"/>
    </article>)); }
export function Graph1({fields: f}: {fields: Record<string,string>}) { return (<ArticleChart figureClassName={`${styles.chartFigure} ${styles.bloodPressureFigure}`} src={f["f25"]!} alt={f["f26"]!} width={2123} height={1589} className={styles.articleChart}/>); }
export function Graph2({fields: f}: {fields: Record<string,string>}) { return (<ArticleChart figureClassName={`${styles.chartFigure} ${styles.heartRiskFigure}`} src={f["f45"]!} alt={f["f46"]!} width={1007} height={1278} className={styles.articleChart}/>); }
