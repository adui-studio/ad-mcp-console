import { z } from 'zod';

const envSchema = z
  .object({
    NODE_ENV: z.enum(['development', 'test', 'production']).default('development'),

    PORT: z.coerce.number().int().positive().default(3001),
    API_PREFIX: z.string().min(1).default('api'),

    LOG_LEVEL: z
      .enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace', 'silent'])
      .default('info'),
    LOG_PRETTY: z.coerce.boolean().default(true),

    DATABASE_URL: z.string().min(1),

    REQUEST_TIMEOUT_MS: z.coerce.number().int().positive().default(15000),

    HTTP_CLIENT_TIMEOUT_MS: z.coerce.number().int().positive().default(10000),
    HTTP_CLIENT_RETRY_COUNT: z.coerce.number().int().min(0).default(1),
    HTTP_CLIENT_RETRY_DELAY_MS: z.coerce.number().int().min(0).default(300),

    HEALTH_MEMORY_HEAP_MB: z.coerce.number().int().positive().default(256),
    HEALTH_MEMORY_RSS_MB: z.coerce.number().int().positive().default(512),
    HEALTH_DISK_THRESHOLD_PERCENT: z.coerce.number().gt(0).lte(1).default(0.9),
    HEALTH_DISK_PATH: z.string().trim().optional(),

    I18N_FALLBACK_LANGUAGE: z.string().min(1).default('zh'),
  })
  .superRefine((env, ctx) => {
    const rawDiskPath = env.HEALTH_DISK_PATH?.trim();

    if (!rawDiskPath) {
      return;
    }

    const isWindows = process.platform === 'win32';
    const isWindowsStylePath = /^[A-Za-z]:\\?$/.test(rawDiskPath);
    const isRootStylePath = rawDiskPath === '/' || rawDiskPath === '\\';

    if (isWindows) {
      if (!isWindowsStylePath) {
        ctx.addIssue({
          code: 'custom',
          path: ['HEALTH_DISK_PATH'],
          message: 'On Windows, HEALTH_DISK_PATH must look like "C:\\" or "D:\\".',
        });
      }
      return;
    }

    if (isWindowsStylePath) {
      ctx.addIssue({
        code: 'custom',
        path: ['HEALTH_DISK_PATH'],
        message:
          'On macOS/Linux, HEALTH_DISK_PATH should normally be "/" or another POSIX path, not "C:\\".',
      });
      return;
    }

    if (isRootStylePath && rawDiskPath !== '/') {
      ctx.addIssue({
        code: 'custom',
        path: ['HEALTH_DISK_PATH'],
        message: 'On macOS/Linux, HEALTH_DISK_PATH should use "/" instead of "\\".',
      });
    }
  });

export type Env = z.infer<typeof envSchema>;

export function validateEnv(config: Record<string, unknown>): Env {
  return envSchema.parse(config);
}
