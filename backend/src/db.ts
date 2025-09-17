import 'dotenv-defaults/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from './config';

(async () => {
  const db = drizzle(config.DATABASE_URL);

  const result = await db.execute('select 1');
  console.log(result);
})();
