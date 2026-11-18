import { formatDateKa } from '@tm/shared';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import type { PostDetail } from '@/server/services/posts';
import { getPostArticleLayout } from '@/content/article-layouts';
import { RichContent } from './rich-content';
import {
  ArticleContent,
  ArticleCta,
  ArticleProse,
  articleProseClassName,
  legacyArticleClassName,
  legacyArticleReadingClassName,
} from './article-layout';
import styles from './post-article.module.css';

/** The default CMS route uses article standards automatically, for HTML and Markdown. */
export function PostArticle({ post }: { post: PostDetail }) {
  const legacy = getPostArticleLayout(post.slug) === 'legacy';
  const body = (
    <RichContent
      content={post.content}
      format={post.contentFormat}
      className={legacy ? 'prose-lg' : articleProseClassName}
    />
  );
  return (
    <article className={legacy ? legacyArticleClassName : undefined}>
      <div className={legacy ? legacyArticleReadingClassName : styles.header}>
        <Link
          href="/blog"
          className="inline-flex items-center gap-2 text-sm text-plum-500 hover:text-plum-800"
        >
          <ArrowLeft aria-hidden="true" className="size-4" />
          ბლოგი
        </Link>
        <h1 className="mt-8 text-[2.1rem] leading-tight font-light text-plum-800 sm:text-5xl sm:leading-[1.15]">
          {post.title}
        </h1>
        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-plum-400">
          {post.authorName !== null ? <span>{post.authorName}</span> : null}
          {post.authorName !== null ? <span aria-hidden="true">·</span> : null}
          {post.publishedAt !== null ? (
            <time dateTime={post.publishedAt.toISOString()}>{formatDateKa(post.publishedAt)}</time>
          ) : null}
          <span aria-hidden="true">·</span>
          <span>{post.readingMinutes} წთ საკითხავი</span>
        </div>
      </div>

      {post.coverImageUrl !== null ? (
        <div className="mx-auto mt-12 max-w-5xl px-4 sm:px-6">
          <img
            src={post.coverImageUrl}
            alt=""
            className="aspect-[16/9] w-full rounded-3xl object-cover"
          />
        </div>
      ) : (
        <div aria-hidden="true" className="dotted-x mx-auto mt-12 h-1 max-w-3xl text-plum-300" />
      )}

      {legacy ? (
        <div className={`${legacyArticleReadingClassName} mt-12`}>{body}</div>
      ) : (
        <>
          <ArticleContent>
            <ArticleProse>{body}</ArticleProse>
          </ArticleContent>
          <ArticleCta />
        </>
      )}
    </article>
  );
}
