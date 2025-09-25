import { z } from 'zod';

const envSchema = z.object({
  //   GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
  REQUESTY_API_KEY: z.string(),
  REQUESTY_BASE_URL: z.string(),
  OPEN_ROUTER_BASE_URL: z.string(),
  OPEN_ROUTER_API_KEY: z.string(),
  AUTH_TOKEN: z.string(),
  DATABASE_URL: z.string(),
  CORS_ORIGIN: z
    .string()
    .transform((val) => val.split(',')) // transform string into array
    .pipe(z.array(z.string().url())),
  NODE_ENV: z
    .enum(['development', 'production', 'test'])
    .default('development'),
  //   PORT: z.string().transform(Number).default('3000'),
  //   CHROMA_HOST: z.string().default('localhost'),
  //   CHROMA_PORT: z.string().transform(Number).default('8000'),
  //   LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export const config = envSchema.parse(process.env);
