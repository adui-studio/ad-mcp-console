import { z } from 'zod';

export const argsJsonSchema = z.array(z.string()).default([]);

export const envJsonSchema = z.record(z.string(), z.string()).default({});

export type ArgsJson = z.infer<typeof argsJsonSchema>;
export type EnvJson = z.infer<typeof envJsonSchema>;

export function parseArgsJson(value: unknown): ArgsJson {
  if (value == null) {
    return [];
  }

  return argsJsonSchema.parse(value);
}

export function parseEnvJson(value: unknown): EnvJson {
  if (value == null) {
    return {};
  }

  return envJsonSchema.parse(value);
}
