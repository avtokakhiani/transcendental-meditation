// Versioned geometry extracted from the approved original. Editorial values live in revisions.
import { ArticleContent, ArticleText, ArticleResearch, ArticleChart, ArticleCta, } from "@/components/article-layout";
import Image from "next/image";
import hero from "@/app/(site)/stress-and-anxiety/stress-and-anxiety.module.css";
import overlay from "@/app/(site)/blog/articles-hero.module.css";
import { ArticlesHeaderBackground } from "@/app/(site)/blog/articles-header-background";
import styles from "@/app/(site)/blog/[slug]/stress-article-hero.module.css";
import type { ReactNode } from 'react';
export function PresetStressArticleHeroV1({fields: f, visuals = []}: {fields: Record<string,string>; visuals?: ReactNode[]}) { return ((<article>
      <ArticlesHeaderBackground />
      <section aria-labelledby="stress-article-heading" className={`${hero.hero} ${overlay.hero} ${styles.hero}`}>
        <Image src={f["f1"]!} alt={f["f2"]!} fill preload quality={90} sizes="100vw" className={`${hero.photograph} ${styles.photograph}`}/>
        <h1 id="stress-article-heading" className={hero.heading}>
          {f["f3"]!}
        </h1>
      </section>
      <ArticleContent>
        <ArticleText>
          <p>{f["f4"]!}</p>
          <p>{f["f5"]!}<strong>{f["f6"]!}</strong>{f["f7"]!}</p>
          <p>{f["f8"]!}<strong>{f["f9"]!}</strong>{f["f10"]!}</p>
          <p>{f["f11"]!}</p>
          <p>{f["f12"]!}<strong>{f["f13"]!}</strong>{f["f14"]!}</p>
          <h2>{f["f15"]!}</h2>
          <p>{f["f16"]!}</p>
          <p>{f["f17"]!}</p>
          <p>{f["f18"]!}<strong>{f["f19"]!}</strong>{f["f20"]!}</p>
          <h2>{f["f21"]!}</h2>
          <p>{f["f22"]!}</p>
          <ul>
            <li><strong>{f["f23"]!}</strong>{f["f24"]!}</li>
            <li><strong>{f["f25"]!}</strong>{f["f26"]!}</li>
            <li><strong>{f["f27"]!}</strong>{f["f28"]!}</li>
            <li><strong>{f["f29"]!}</strong>{f["f30"]!}</li>
            <li><strong>{f["f31"]!}</strong>{f["f32"]!}</li>
            <li><strong>{f["f33"]!}</strong>{f["f34"]!}</li>
            <li><strong>{f["f35"]!}</strong>{f["f36"]!}</li>
            <li><strong>{f["f37"]!}</strong>{f["f38"]!}</li>
            <li><strong>{f["f39"]!}</strong>{f["f40"]!}</li>
            <li><strong>{f["f41"]!}</strong></li>
            <li><strong>{f["f42"]!}</strong>{f["f43"]!}</li>
          </ul>
          <p>{f["f44"]!}</p>
          <h2>{f["f45"]!}</h2>
          <p><a href={f["f46"]!} target="_blank" rel="noopener noreferrer" className="text-plum-800 underline decoration-plum-300 underline-offset-4 hover:decoration-plum-800">{f["f47"]!}</a>{f["f48"]!}<strong>{f["f49"]!}</strong>{f["f50"]!}</p>
          <p>{f["f51"]!}</p>
          <ul>
            <li><strong>{f["f52"]!}</strong>{f["f53"]!}</li>
            <li><strong>{f["f54"]!}</strong>{f["f55"]!}</li>
            <li><strong>{f["f56"]!}</strong>{f["f57"]!}</li>
            <li><strong>{f["f58"]!}</strong>{f["f59"]!}</li>
          </ul>
          <h2>{f["f60"]!}</h2>
          <p>{f["f61"]!}</p>
          <p>{f["f62"]!}</p>
          <p>{f["f63"]!}</p>
          <ul>
            <li>{f["f64"]!}</li>
            <li>{f["f65"]!}</li>
            <li>{f["f66"]!}</li>
            <li>{f["f67"]!}</li>
            <li>{f["f68"]!}</li>
            <li>{f["f69"]!}</li>
            <li>{f["f70"]!}</li>
            <li>{f["f71"]!}</li>
          </ul>
          <p>{f["f72"]!}<strong>{f["f73"]!}</strong>{f["f74"]!}</p>
          <h2>{f["f75"]!}</h2>
          <p>{f["f76"]!}</p>
          <p>{f["f77"]!}<strong>{f["f78"]!}</strong>{f["f79"]!}</p>
          <p>{f["f80"]!}<strong>{f["f81"]!}</strong>{f["f82"]!}</p>
          <p>{f["f83"]!}<strong>{f["f84"]!}</strong>{f["f85"]!}</p>
          <p>{f["f86"]!}</p>
          <h2>{f["f87"]!}</h2>
          <p>{f["f88"]!}<strong>{f["f89"]!}</strong>{f["f90"]!}</p>
          <p>{f["f91"]!}<strong>{f["f92"]!}</strong>{f["f93"]!}</p>
        </ArticleText>
        <ArticleResearch chart={<>{visuals[0]}</>}>
          <p>{f["f96"]!}<strong>{f["f97"]!}</strong>{f["f98"]!}</p>
          <p>{f["f99"]!}</p>
          <ul>
            <li><strong>{f["f100"]!}</strong>{f["f101"]!}</li>
            <li><strong>{f["f102"]!}</strong>{f["f103"]!}</li>
            <li><strong>{f["f104"]!}</strong>{f["f105"]!}</li>
            <li><strong>{f["f106"]!}</strong>{f["f107"]!}</li>
          </ul>
        </ArticleResearch>
        <ArticleResearch chartSide="left" chart={<>{visuals[1]}</>}>
          <ul>
            <li><strong>{f["f110"]!}</strong>{f["f111"]!}</li>
            <li><strong>{f["f112"]!}</strong>{f["f113"]!}</li>
            <li><strong>{f["f114"]!}</strong>{f["f115"]!}</li>
            <li><strong>{f["f116"]!}</strong>{f["f117"]!}</li>
          </ul>
        </ArticleResearch>
      </ArticleContent>
      <ArticleCta headingId="stress-teacher-heading"/>
    </article>)); }
export function Graph1({fields: f}: {fields: Record<string,string>}) { return (<ArticleChart src={f["f94"]!} className={styles.traitAnxietyChart} alt={f["f95"]!} width={881} height={1253}/>); }
export function Graph2({fields: f}: {fields: Record<string,string>}) { return (<ArticleChart src={f["f108"]!} alt={f["f109"]!} width={1794} height={1589} className={styles.bloodPressureChart}/>); }
