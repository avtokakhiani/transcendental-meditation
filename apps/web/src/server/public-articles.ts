import {cache} from 'react';
import {prisma} from './db';
import {getPublishedArticle,listPublishedArticles} from './services/published-articles';

// Request-scoped memoization only. Routes remain dynamic; drafts are never queried here.
export const publicArticle = cache((slug:string)=>getPublishedArticle(prisma,slug));
export const publicArticleCatalog = cache(()=>listPublishedArticles(prisma));
