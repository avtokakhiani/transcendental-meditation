import js from '@eslint/js';
import tseslint from 'typescript-eslint';

export default tseslint.config(
  {
    ignores: ['**/node_modules/**', '**/.next/**', '**/next-env.d.ts', '**/dist/**', '**/build/**'],
  },
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    // Node-only scripts: the Prisma seed and config files, none of which run in a browser.
    files: ['**/prisma/seed.ts', '**/*.config.{js,mjs,ts}'],
    languageOptions: {
      globals: {
        console: 'readonly',
        process: 'readonly',
        URL: 'readonly',
      },
    },
  },
  {
    files: ['apps/web/src/server/services/**/*.ts'],
    rules: {
      // Keeps the business layer framework-free so it can be lifted out of Next.js without a rewrite.
      'no-restricted-imports': [
        'error',
        {
          patterns: [
            {
              group: ['next', 'next/*', 'server-only'],
              message: 'Services must stay framework-agnostic. Handle Next.js concerns in the route handler.',
            },
          ],
        },
      ],
    },
  },
);
