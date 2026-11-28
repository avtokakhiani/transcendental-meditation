# F01: private-file packaging remediation

Local implementation: 25 November 2026. Scope is the private-file/production-artifact blocker only. No production deployment, DNS/provider changes, registration changes, Calendar automation or SEO work is included.

## Changes

The privacy filesystem contains mutable operational records, not application assets. `apps/web/src/server/privacy-files.ts` now streams directory entries, skips symlinks and explicitly marks the two dynamic runtime path joins with Next's documented `turbopackIgnore` tracing annotation. This stops those calls from making instrumentation trace the entire project; it is not a blanket warning suppression. Managed expiry dates and the legacy mtime fallback are retained. Independent trace exclusions and artifact checks enforce the same boundary even if tracing regresses or a different bundler is used.

`privacy-storage-path.ts` preserves the existing development `apps/web/private` location. Production now requires an explicit absolute `PRIVACY_STORAGE_DIR` physically separate from the release/workspace tree. Checks include real paths of existing ancestors to reject a symlink into `public` or the release. Missing/relative/in-release production paths fail closed. **Existing private data and the working `.env` were not moved or changed.** Choosing and migrating a real durable production ledger remains F11 and requires owner infrastructure decisions.

`next.config.ts` excludes private state, environment files, development output, first-party source/test/recovery scripts and audit evidence from deployment tracing. Shared packages and necessary generated Prisma/native dependencies remain available. `.dockerignore` excludes sensitive/development material, and the Dockerfile replaces `COPY . .` with explicit build inputs. The runner copies only a verified assembled release.

Next can also copy loaded runtime environment files independently of dependency tracing. A production-build phase guard (`build-inputs.mjs`) therefore refuses `.env` files before compilation, including a direct `next build` from a configured working checkout. Only the exact harmless packaging marker is allowed. Development still loads its existing `.env`. An actual bare-build negative check with a synthetic `.env.production` confirms the guard, rather than relying only on the release wrapper or artifact rejection.

The release tools under `scripts/release/` add these controls:

1. `prepare-build.mjs` copies an allowlist into a **new external** workspace, excluding real `.env`, private state and historical evidence. It refuses symlinked source and destination reuse. Only synthetic tracing canaries are then created in private/tooling/env-like paths; they must never appear in the final package.
2. `assemble-artifact.mjs` checks raw traced output before copying, materializes runtime dependencies/Prisma and copies the unchanged public/static assets. Dependency materialization preserves complete transitive closures beside each package, including Turbopack's mangled externals; a resolver check rejects missing dependencies or resolution outside the artifact. This repairs a real relocated-runtime failure (`postcss` could not resolve `picocolors`) found by the smoke test. It refuses a workspace containing runtime env files and refuses contaminated/reused destinations. Its manifest is stored beside the release, not inside it.
3. `verify-artifact.mjs` validates the assembled tree and the **actual gzip/USTAR archive**. It rejects private/env/backup/key/log/evidence/tooling paths, files outside the runtime layout, symlinks/special files, duplicate/traversing archive entries, known secret signatures, encrypted-backup headers and canaries. An optional local env-file input checks configured secret values without printing them. No archive is extracted before verification. This is a bounded secret-signature/known-value check, not a claim to detect every possible personal datum or arbitrary secret.
4. The GitHub workflow builds from the isolated input workspace, validates the directory/archive before upload, uploads the archive alone, then revalidates the downloaded archive before extraction and the extracted directory before deployment. Existing lint/test gates remain in place. No workflow was triggered by this local task.

Webpack retains `packages/shared/package.json` as workspace identity metadata. The gate permits only that exact file, with the expected `@tm/shared` identity, and its two parent directories. Workspace source, tests, arbitrary sibling manifests and private paths remain forbidden. The initial strict gate caught this bundler difference; it was resolved through this narrow metadata allowance, not by allowing a general `packages/**` subtree.

The default production-layout build exposed two existing typed-route errors that the historical article-test dist layout had not caught. Type-only `Route` annotations were added at the article alias redirect and preserved introduction link. A TypeScript emission comparison verifies identical JavaScript after removing types/redundant parentheses. URLs, values, texts, geometry, styling and behavior were not changed.

## Backups and safety boundary

Before implementation, encrypted source/configuration (including the existing `.env`) and a fresh SQL COPY_ONLY/CHECKSUM backup were created outside the repository under `%LOCALAPPDATA%/learnTM/prelaunch/f01-1795597728044/`. Encryption uses the existing local backup key; the key is not copied into reports or packages. Readback encryption/hash verification passed. Plaintext native SQL staging files were removed from host/container.

The native backup was restored into a newly named guarded disposable SQL database. RESTORE CHECKSUM, DBCC CHECKDB and an exact all-table comparison passed. Packaged runtime checks use this disposable copy and an explicitly supplied private test directory, never the working database or its ledger. No seed, working-record mutation or media change is part of the remediation.

Evidence logs/manifests are in that same external run directory, outside all build inputs. They may include administrative source/recovery metadata and are not public release files. The encrypted backups must retain their key and receive the owner's retention/access review; nothing here supersedes F12 or the production recovery requirements.

## Verification

Evidence directory: `%LOCALAPPDATA%/learnTM/prelaunch/f01-1795597728044/`. Reports contain safe summaries and manifests; encrypted source/SQL snapshots remain separate from all packages.

| Check | Evidence / result |
| --- | --- |
| Backup creation and restore | `backup-verification.json`, `runtime-test.json`: encrypted readback, SQL COPY_ONLY/CHECKSUM, VERIFYONLY, restored DBCC CHECKDB and exact all-table comparison passed. |
| Working data/configuration preservation | `working-database-preservation.json`, `source-preservation.json`: all working tables unchanged; `.env` byte-identical; all other existing application source unchanged. The two public type annotations emit identical JavaScript. |
| Focused regressions | `security-tests-final.log`, `privacy-tests-final.log`, `article-tests-final.log`: 10 artifact/build-boundary, 2 privacy filesystem and 10 existing article document/render cases passed (22 total). |
| Type/lint checks | Production build TypeScript and separate working-project TypeScript passed. `focused-lint-final.log`: changed application/config/release sources pass. The existing repository-wide 139 lint errors remain an independent blocker. |
| Bare build guard | `build-guard-verification.json`, `build-guard-negative.log`: actual `next build` rejects synthetic runtime `.env.production`; the prepared default production-layout build passes in `build-production-guarded.log`. No broad privacy tracing warnings remain. |
| Docker input boundary | `docker-context.log`: controlled private/env/recovery/evidence markers are excluded from the actual Docker context; legitimate source remains. Docker additionally uses explicit source copies. |
| Fresh Linux package/native runtime | `docker-guarded-verification.log`: Docker `package` target builds with Webpack, passes raw/final gates (6,091 files / 353,146,434 bytes, zero findings), and loads Prisma with `RUN --network=none` against an unreachable synthetic endpoint. |
| Public preservation | Development and relocated standalone browser reports cover all 28 existing public routes at widths 1440, 768 and 390, plus 23 internal-link checks. No failed pages, horizontal overflow, broken visible images, missing image alt attributes or client exceptions. All 64 public assets (89,379,172 bytes) are byte-identical. |
| Article administration | `admin-runtime-smoke.json`: article list/new/editor, book/media administration and four private previews work from the relocated package; anonymous preview redirects to login; previews retain no-store/noindex. No save/publish operations were performed. |

The 84-view public check includes every existing “რატომ TM?” destination, four published articles, the real book and all seven reader pages. Source/asset comparisons establish preservation of approved content, graphs, typography and spacing; browser checks provide runtime coverage rather than a new visual redesign or editorial approval. All smoke-test data comes from the disposable restored database. External mail/Calendar actions and form mutations are disabled or intercepted during tests.

The Windows archive is a local verification artifact containing Windows-native runtime modules; it is **not** an Azure/Linux deployment bundle. The Docker verification independently builds and gates the Linux/Webpack package and loads its native Prisma engine against an unreachable synthetic SQL endpoint with networking disabled. CI similarly builds on Linux. No cloud workflow or deployment was run.

Final guarded Windows archive: `web-release-guarded.tar.gz`, 216,398,291 compressed bytes; 6,987 files / 469,475,559 uncompressed bytes. SHA-256: `643f8ab008108a5101b5b02233d170584733366258b9b80a20489f5183a090d6`. The directory and actual archive pass forbidden-path/canary/signature and known-local-secret checks with zero findings (`guarded-directory-verification.json`, `guarded-archive-verification.json`).

`guarded-extracted-verification.json` and `final-verification-summary.json` confirm that the assembled directory, actual archive and freshly extracted directory have exactly matching per-file hashes and zero findings. Both Windows and Linux native engine checks passed against synthetic unreachable SQL settings. The verified archive rejects missing production private storage, then serves successfully with the supplied external test directory (`guarded-startup-boundary.json`). The external erasure ledger remains byte-identical across release relocation. Final browser/admin checks use this exact extracted archive (`production-guarded-browser.log`, `production-final-browser.json`, `admin-runtime-smoke.json`).

Cleanup is recorded in `local-test-cleanup.json`: the temporary production server on port 31998 is stopped and only the manifest-named disposable restored database was removed. A subsequent exact comparison confirms that every working database table still matches the encrypted before snapshot. The normal host development server remains at http://localhost:31997 with automatic reload; SQL/Azurite remain running. Encrypted backups and private verification evidence are retained outside the repository. Review their access/retention with the owner; the 30-day backup horizon falls on 25 December 2026. No working data, original private ledger, media or `.env` was deleted or migrated.

## Reproducing a local release check

Keep the normal host development workflow (`start-dev.ps1`, localhost:31997). Do production-package checks in an isolated external workspace; do not run `next build` over the development server's output.

```powershell
# Choose new external paths; these commands refuse reused destinations.
node scripts/release/prepare-build.mjs C:/path/outside-repo/learntm-build
Set-Location C:/path/outside-repo/learntm-build
pnpm.cmd install --frozen-lockfile --ignore-scripts
Set-Location apps/web
$env:DATABASE_URL = 'sqlserver://127.0.0.1:1;database=build;user=build;password=build'
$env:AUTH_SECRET = 'build-time-placeholder-value-at-least-32-chars'
$env:AZURE_STORAGE_ACCOUNT = 'placeholder'
$env:ARTICLE_TEST_SERVER = 'false'
pnpm.cmd exec prisma generate
pnpm.cmd exec next build
# Return to the original repository to run its release tooling:
# node scripts/release/assemble-artifact.mjs <isolated-apps/web> <new-release-directory>
# node scripts/release/verify-artifact.mjs --directory <release-directory>
# tar --format=ustar -czf <archive.tar.gz> -C <release-directory> .
# node scripts/release/verify-artifact.mjs --archive <archive.tar.gz>
```

Run those commands in a separate PowerShell session, using only synthetic build settings. Never copy the working `.env`, SQL backups, deletion ledger or evidence into the build workspace. The existing local server still uses its original configuration. An optional `--secrets-env-file apps/web/.env` on the verifier reads values privately for comparison; do not copy that file into the release or print its contents. Reports/manifests belong outside the release directory.

Run focused security regressions from the original repository:

```powershell
node --test scripts/release/artifact-security.test.mjs
pnpm.cmd --filter @tm/web exec tsx --test tests/privacy-packaging.test.ts
```

## Remaining limitations / owner handoff

- The removed historical contaminated artifact has no surviving local per-file manifest. Exact prior membership, cloud artifact recipients/access and any necessary credential rotation cannot be established from this workspace. An owner with artifact/account access must finish that review. Do not reuse historical bundles or claim that no external transfer occurred merely because the local artifact was removed.
- Production durable private storage, ACLs, shared/multi-instance behavior, ledger migration/restore and real provider retention remain F11/F12/F14. A production Docker/container/App Service launch now intentionally refuses to use private state inside the release. The existing Compose web definition has not been configured with a new production private mount; do not start it as a substitute for completing those decisions. Host development is preserved.
- The existing metadataBase warning, 139 repository lint errors, dependency advisories, simulated registration functionality and all other audit blockers remain open. No global lint bypass, privacy-attestation changes or disabled production startup guard were introduced.
- Local package verification does not prove the inaccessible GitHub environment protections, Azure configuration or historical distribution. CI/cloud deployment was not executed. The site remains **NO-GO** until the other mandatory gates and owner review are complete.

Stop here before F04 or any other independent blocker.
