import { z } from 'zod';

export const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),
  PORT: z.coerce.number().int().positive().default(3001),
  API_PREFIX: z.string().min(1).default('api'),

  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent']).default('info'),
  LOG_PRETTY: z.coerce.boolean().default(true),

  DATABASE_URL: z.string().min(1),

  HTTP_CLIENT_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
  HTTP_CLIENT_RETRY_COUNT: z.coerce.number().int().min(0).default(1),
  HTTP_CLIENT_RETRY_DELAY_MS: z.coerce.number().int().min(0).default(300),

  HEALTH_MEMORY_HEAP_MB: z.coerce.number().int().positive().default(256),
  HEALTH_MEMORY_RSS_MB: z.coerce.number().int().positive().default(512),
  HEALTH_DISK_THRESHOLD_PERCENT: z.coerce.number().gt(0).lte(1).default(0.9),
  HEALTH_DISK_PATH: z.string().min(1).default('/'),
});

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
