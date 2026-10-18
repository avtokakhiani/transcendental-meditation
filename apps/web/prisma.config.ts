import { existsSync } from 'node:fs';
import path from 'node:path';
import { defineConfig } from 'prisma/config';

const envPath = path.join(import.meta.dirname, '.env');
if (existsSync(envPath)) process.loadEnvFile(envPath);

export default defineConfig({
  schema: path.join('prisma', 'schema.prisma'),
  migrations: {
    seed: 'tsx prisma/seed.ts',
  },
});
