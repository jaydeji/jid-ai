import 'dotenv/config';
import { drizzle } from 'drizzle-orm/node-postgres';
import { eq } from 'drizzle-orm';
import { usersTable } from '../schema';

const db = drizzle(process.env.DATABASE_URL!);

async function main() {
  const user: typeof usersTable.$inferInsert = {
    // userId: 'google:110510818893952848592',
    firstName: 'Test1',
    lastName: 'Test',
    email: 'test1@gmail.com',
    avatar: '',
    additionalInfo:
      'Never use this symbol "—". Don’t reference my occupation unless absolutely necessary',
    currentModelParameters: {
      includeSearch: true,
      reasoningEffort: 'high',
    },
    currentlySelectedModel: 'nvidia/nemotron-nano-9b-v2:free',
    // disableExternalLinkWarning: true,
    favoriteModels: [
      'nvidia/nemotron-nano-9b-v2:free',
      'deepseek/deepseek-r1:free',
    ],
  };

  await db.insert(usersTable).values(user);
  console.log('New user created!');

  // const users = await db.select().from(usersTable);
  // console.log('Getting all users from the database: ', users);

  // await db
  //   .update(usersTable)
  //   .set({
  //     age: 31,
  //   })
  //   .where(eq(usersTable.email, user.email));
  // console.log('User info updated!');

  // await db.delete(usersTable).where(eq(usersTable.email, user.email));
  // console.log('User deleted!');
}

main();
