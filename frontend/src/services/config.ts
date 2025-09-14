// import.meta.env.DEV app running on dev
// import.meta.env
import { z } from 'zod'

const envSchema = z.object({
  VITE_API_URL: z.string(),
  VITE_CONVEX_URL: z.string(),
  VITE_CONVEX_DEP_URL: z.string(),
  DEV: z.boolean(),
})

export const config = envSchema.parse(import.meta.env)
