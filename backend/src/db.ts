import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from './config';
import { chatsTable, messagesTable, usersTable } from './schema';
import { eq } from 'drizzle-orm';

export class DB {
  db;

  constructor() {
    this.db = drizzle(config.DATABASE_URL);
  }

  getUserById = (userId: string) => {
    return this.db
      .select()
      .from(usersTable)
      .where(eq(usersTable.userId, userId))
      .limit(1);
  };

  getUserByemail = async (email: string) => {
    return (
      await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1)
    )[0];
  };

  addUser = async (user: any) => {
    return (
      await this.db
        .insert(usersTable)
        .values({
          ...user,
          // avatar: '',
          // additionalInfo:
          //   'Never use this symbol "—". Don’t reference my occupation unless absolutely necessary',
          // currentModelParameters: {
          //   includeSearch: true,
          //   reasoningEffort: 'high',
          // },
          // currentlySelectedModel: 'nvidia/nemotron-nano-9b-v2:free',
          // disableExternalLinkWarning: true,
          // favoriteModels: [
          //   'nvidia/nemotron-nano-9b-v2:free',
          //   'deepseek/deepseek-r1:free',
          // ],
        })
        .returning()
    )[0];
  };

  getChatById = async (id: string) => {
    return (
      await this.db
        .select()
        .from(chatsTable)
        .where(eq(chatsTable.id, id))
        .limit(1)
    )?.[0];
  };

  getMessagesByChatById = async (id: string) => {
    return await this.db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, id));
  };
}

export const db = new DB();
