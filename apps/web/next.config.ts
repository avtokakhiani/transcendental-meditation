import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'X-Frame-Options', value: 'DENY' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'Content-Security-Policy', value: "base-uri 'self'; object-src 'none'; frame-ancestors 'none'; frame-src 'self' https://www.google.com" },
      ...(process.env.PRIVACY_LAUNCH_APPROVED !== 'true' ? [{ key: 'X-Robots-Tag', value: 'noindex, nofollow' }] : []),
      ...(process.env.NODE_ENV === 'production' ? [{ key: 'Strict-Transport-Security', value: 'max-age=31536000' }] : []),
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
  // Workspace packages ship raw TypeScript, so Next must compile them rather than expect a build step.
  transpilePackages: ['@tm/shared'],
  typedRoutes: true,
  images: {
    qualities: [75, 90],
  },
};

export default nextConfig;
