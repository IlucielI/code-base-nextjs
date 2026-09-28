import { z } from 'zod';

/**
 * Runtime Environment Variables Validation Schema.
 * Validates and freezes server configuration on initialization to fail fast on invalid configurations.
 */
export const EnvSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  APP_ENV: z.string().default('development'),
  APP_NAME: z.string().default('code-base-nextjs'),
  APP_VERSION: z.string().default('0.1.0'),
  GIT_HASH: z.string().default('dev'),
  PORT: z.coerce.number().int().positive().default(3000),
  CORE_API_URL: z.string().default(''),
  MOCK_CORE_API: z
    .preprocess((val) => val === 'true' || val === true || val === '1', z.boolean())
    .default(false),
  USE_MOCK_DATA: z
    .preprocess((val) => val === 'true' || val === true || val === '1', z.boolean())
    .default(false),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).optional(),
});

export type Env = z.infer<typeof EnvSchema>;

/**
 * Validates and returns environment variables against EnvSchema.
 */
export function validateEnv(customEnv?: Record<string, unknown>): Env {
  const source = customEnv ?? process.env;
  const result = EnvSchema.safeParse(source);

  if (!result.success) {
    const formatted = result.error.format();
    throw new Error(`Environment validation failed:\n${JSON.stringify(formatted, null, 2)}`);
  }

  return Object.freeze(result.data);
}

/**
 * Active application environment configuration.
 */
export const env: Env = validateEnv();

export const isProduction = env.NODE_ENV === 'production';
export const isDevelopment = env.NODE_ENV === 'development';
export const isTest = env.NODE_ENV === 'test';
