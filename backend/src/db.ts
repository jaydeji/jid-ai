import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from './config';
import { chatsTable, messagesTable, usersTable } from './schema';
import { asc, desc, DrizzleQueryError, eq } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';
import * as schema from './schema';

const handleConnectionError = (error: any) => {
  if (
    error instanceof DrizzleQueryError &&
    (error?.cause as any)?.code === 'ECONNREFUSED'
  ) {
    console.error(error);
    throw { error: 'Internal server error', status: 500 };
  }
};

export class DB {
  db;

  constructor() {
    this.db = drizzle(config.DATABASE_URL, { logger: false, schema });
  }

  getUserById = async (userId: string) => {
    return (
      await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.userId, userId))
        .limit(1)
    )?.[0];
  };

  getUserByemail = async (email: string) => {
    return (
      await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.email, email))
        .limit(1)
        .catch((error) => {
          handleConnectionError(error);

          console.error(error);
          throw { error: 'User not found', status: 404 };
        })
    )[0];
  };

  addUser = async (user: any) => {
    return (
      await this.db
        .insert(usersTable)
        .values({
          ...user,
        })
        .returning()
    )[0];
  };

  getChatById = async (id: string) => {
    try {
      return (
        await this.db
          .select()
          .from(chatsTable)
          .where(eq(chatsTable.id, id))
          .limit(1)
      )?.[0];
    } catch (error) {
      console.error('Chat not found');
      return undefined;
    }
  };

  getChats = (userId: string) => {
    try {
      return this.db
        .select()
        .from(chatsTable)
        .where(eq(chatsTable.userId, userId))
        .orderBy(desc(chatsTable.updatedAt));
    } catch (error) {
      console.error('User chats not found');
      return undefined;
    }
  };

  getMessages = (id: string) => {
    return this.db.query.messagesTable.findMany({
      where: (message, { eq }) => eq(message.chatId, id),
    });
  };

  getMessagesByChatId = async (id: string) => {
    return await this.db.query.chatsTable.findFirst({
      where: (chats, { eq }) => eq(chats.id, id),
      with: {
        messages: {
          orderBy: (m, { asc }) => [asc(m.createdAt)],
        },
      },
    });
  };

  updateChat = async (data: any, tx?: PgTransaction<any>) => {
    await (tx || this.db)
      .update(chatsTable)
      .set(data)
      .where(eq(chatsTable.id, data.id));
  };

  createChat = async (chat: any, tx?: PgTransaction<any>) => {
    return (
      await (tx || this.db).insert(chatsTable).values(chat).returning()
    )?.[0];
  };

  createMessages = async (messages: any[], tx?: PgTransaction<any>) => {
    return await (tx || this.db)
      .insert(messagesTable)
      .values(messages)
      .returning();
  };

  updateUser = async (userId: string, data: any, tx?: PgTransaction<any>) => {
    return await (tx || this.db)
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.userId, userId));
  };

  /**
   * Update a single message by id (if needed)
   */
  // updateMessageById = async (id: string, data: any) => {
  //   return await this.db
  //     .update(messagesTable)
  //     .set(data)
  //     .where(eq(messagesTable.id, id));
  // };

  // transaction = <T>(
  //   callback: (tx: PgTransaction<any>) => Promise<T>,
  //   options?: any
  // ) => {
  //   return this.db.transaction(callback, options);
  // };

  createOrUpdateChatTrans = <T>(cb: (tx: any) => Promise<T>) => {
    return this.db.transaction(async (tx) => {
      cb(tx);
    });
  };
}

export const db = new DB();
