import { createClient } from '@libsql/client';
import { drizzle } from 'drizzle-orm/libsql';
import { config } from './config';

// This pulls from env vars for safety
const client = createClient({
  url: config.LIBSQL_URL,
  // If you plan to protect with auth tokens, add:
  //   authToken: process.env.LIBSQL_AUTH_TOKEN,
});

export const db = drizzle({ client });
