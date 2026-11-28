import path from 'node:path';
import type { NextConfig } from 'next';
import { PHASE_PRODUCTION_BUILD } from 'next/constants';
import { assertSafeBuildInputs } from './build-inputs.mjs';

const nextConfig: NextConfig = {
  // Separate host development output for the isolated article workflow test server.
  distDir: process.env.ARTICLE_TEST_SERVER === 'true' ? '.next/article-tests' : '.next',
  // OAuth codes and state must never appear in development request logs.
  logging: { incomingRequests: { ignore: [/\/api\/admin\/calendar-test\/callback(?:\?|$)/] } },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; frame-src 'self' https://www.google.com" },
      ...(process.env.PRIVACY_LAUNCH_APPROVED !== 'true' ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
      ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
    ] }, ...['/admin/calendar-test', '/api/admin/calendar-test/:path*'].map(source => ({ source, headers: [
      { key: 'Cache-Control', value: 'private, no-store' },
      // no-referrer makes native form POSTs send Origin: null and fail strict CSRF checks.
      // Only the clean admin page permits same-origin referrers; OAuth API/callback URLs never do.
      { key: 'Referrer-Policy', value: source === '/admin/calendar-test' ? 'same-origin' : 'no-referrer' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
    ] })), { source: '/admin/posts/:path*', headers: [
      { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      { key: 'Referrer-Policy', value: 'same-origin' },
    ] }, { source: '/admin/article-preview/:path*', headers: [
      { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
      { key: 'X-Robots-Tag', value: 'noindex, nofollow' },
      { key: 'Referrer-Policy', value: 'same-origin' },
    ] }];
  },
  reactStrictMode: true,
  experimental: {
    agentUpgrade: 'security',
  },
  // Emits a self-contained server.js; without it App Service would need the whole pnpm
  // node_modules tree, whose symlinks do not survive the deploy.
  output: 'standalone',
  // Tracing must start at the workspace root or the shared packages are left out of the bundle.
  outputFileTracingRoot: path.join(import.meta.dirname, '../..'),
  // Private runtime state is mounted separately. Neither it nor development and
  // recovery evidence is a deployment dependency, even when present on a builder.
  outputFileTracingExcludes: {
    '/*': [
      './private/**/*', '../../**/private/**/*',
      './.env*', '../../.env*', '../../**/.env*',
      './build-inputs.mjs',
      './src/**/*', './content/**/*', './prisma/**/*', './tests/**/*', './scripts/**/*', './docs/**/*',
      '../../docs/**/*', '../../scripts/**/*', '../../output/**/*',
      '../../packages/*/test/**/*', '../../packages/*/tests/**/*',
      '../../**/*.bak', '../../**/*.bak.enc', '../../**/*.log', '../../**/*.jsonl',
      './.next/dev/**/*', './.next/dev-recovery-*/**/*',
      '../../.git/**/*', '../../.github/**/*',
    ],
  },
  // Workspace packages ship raw TypeScript, so Next must compile them rather than expect a build step.
  transpilePackages: ['@tm/shared'],
  typedRoutes: true,
  images: {
    qualities: [75, 90],
  },
};

export default function config(phase: string): NextConfig {
  if (phase === PHASE_PRODUCTION_BUILD) assertSafeBuildInputs(import.meta.dirname);
  return nextConfig;
}
