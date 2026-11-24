# Historical article architecture — recovery and migration fixtures only

No application module imports this directory. Nothing here supplies live public
article content, ordering, card copy, publication state or metadata.

| Archive | Retained purpose |
| --- | --- |
| `article-catalog.ts`, `article-card-copy.ts` | Original Phase 4 migration inputs; baseline provenance; legacy recommendation tests |
| `legacy-related-articles.ts` | Historical deterministic-selection tests only |
| `legacy-posts.ts` | Foundation recovery checks and tests simulating old-field writes; not an admin/public publishing service |
| `legacy-post-article.tsx`, `legacy-layouts.ts` | Historical layout fixture only; original stylesheet remains in its approved location |
| `legacy-delivery.tsx.txt`, `delivery.ts.txt` | Former route orchestration and Phase 5 flag, stored as non-runtime source evidence |

The Phase 5 `ARTICLE_PUBLIC_DELIVERY=legacy` switch is retired in Phase 6.
Setting it no longer changes delivery. Recovery must be deliberate; do not put
archived catalogs back into normal public consumers or add new articles here.

Approved scientific layouts, graphs and SVG assets remain in their original
locations; versioned structured presets and database revision history are retained.
Historical HTML/Markdown compatibility remains in the validated revision renderer.

The verified encrypted SQL backup is separate from this source archive. Use
`rehearse-phase6-recovery.mjs` only against its manifest-named disposable database,
with its dev server stopped. It refuses the working database, verifies checksum,
restores to explicit isolated physical paths, runs DBCC and compares all tables.
Preserve the ignored backup key. A deliberate recovery of newer editorial data
requires review; never overwrite the working database as routine rollback.

Source evidence here is not a complete previous release checkout. For a full
application rollback use a reviewed release/source snapshot; this phase does not
manufacture a historical Git commit from the user's uncommitted workspace.
