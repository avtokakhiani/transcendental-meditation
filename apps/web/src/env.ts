import { z } from 'zod';

/**
 * Validated once at module load so a misconfigured deployment fails at boot rather than on the
 * first request that happens to touch the missing variable.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  DATABASE_URL: z.string().min(1),

  AUTH_SECRET: z.string().min(32, 'AUTH_SECRET must be at least 32 characters'),

  AZURE_STORAGE_ACCOUNT: z.string().min(1),
  AZURE_STORAGE_CONTAINER: z.string().min(1).default('media'),
  /** Omitted in Azure, where managed identity is used instead. Required against local Azurite. */
  AZURE_STORAGE_CONNECTION_STRING: z.string().optional(),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  const issues = parsed.error.issues
    .map((issue) => `  ${issue.path.join('.')}: ${issue.message}`)
    .join('\n');
  throw new Error(`Invalid environment configuration:\n${issues}`);
}

export const env = parsed.data;
