import { z } from 'zod';

const envSchema = z.object({
  //   GOOGLE_GENERATIVE_AI_API_KEY: z.string(),
  REQUESTY_API_KEY: z.string(),
  REQUESTY_BASE_URL: z.string(),
  AUTH_PASS: z.string(),
  //   MARKDOWN_PATH: z.string(),
  //   NODE_ENV: z
  //     .enum(['development', 'production', 'test'])
  //     .default('development'),
  //   PORT: z.string().transform(Number).default('3000'),
  //   CHROMA_HOST: z.string().default('localhost'),
  //   CHROMA_PORT: z.string().transform(Number).default('8000'),
  //   LOG_LEVEL: z.enum(['error', 'warn', 'info', 'debug']).default('info'),
});

export const config = envSchema.parse(process.env);
