import path from 'node:path';
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
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
