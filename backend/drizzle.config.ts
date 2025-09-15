import 'dotenv/config';

import { defineConfig } from 'drizzle-kit';
import { config } from './src/config';

export default defineConfig({
  out: './drizzle',
  schema: './src/schema.ts',
  dbCredentials: {
    url: config.DATABASE_URL,
    // Alternative: individual connection params
    // host: 'localhost',
    // port: 5432,
    // user: 'aiuser',
    // password: 'your_secure_password_here',
    // database: 'aiapp',
    // ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
  },
  verbose: true,

  dialect: 'postgresql',
  strict: true, // Enable strict mode
});
