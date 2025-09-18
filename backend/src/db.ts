import { drizzle } from 'drizzle-orm/node-postgres';
import { config } from './config';
import { chatsTable, messagesTable, usersTable } from './schema';
import { eq } from 'drizzle-orm';
import type { PgTransaction } from 'drizzle-orm/pg-core';

export class DB {
  db;

  constructor() {
    this.db = drizzle(config.DATABASE_URL);
  }

  getUserById = async (userId: string) => {
    return (
      await this.db
        .select()
        .from(usersTable)
        .where(eq(usersTable.userId, userId))
        .limit(1)
    )?.[0];
    // return (
    //   await this.db
    //     .select()
    //     .from(usersTable)
    //     .where(eq(usersTable.userId, userId))
    //     .limit(1)
    // )?.[0];
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

  getChatAndMessagesById = async (id: string) => {
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
        .where(eq(chatsTable.userId, userId));
    } catch (error) {
      console.error('User chats not found');
      return undefined;
    }
  };

  getMessagesByChatById = async (id: string) => {
    return await this.db
      .select()
      .from(messagesTable)
      .where(eq(messagesTable.chatId, id));
  };

  updateChat = async (data: any, tx?: PgTransaction<any>) => {
    await (this.db || tx)
      .update(chatsTable)
      .set(data)
      .where(eq(chatsTable.id, data.id));
  };

  createChat = async (chat: any, tx?: PgTransaction<any>) => {
    return (
      await (this.db || tx).insert(chatsTable).values(chat).returning()
    )?.[0];
  };

  createMessages = async (messages: any[], tx?: PgTransaction<any>) => {
    return await (this.db || tx)
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
