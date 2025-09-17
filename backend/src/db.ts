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

  updateChat = async (id: string, data: any) => {
    await this.db.update(chatsTable).set(data).where(eq(chatsTable.id, id));
  };

  createChat = async (chat: any) => {
    return (await this.db.insert(chatsTable).values(chat).returning())?.[0];
  };

  createMessages = async (messages: any[]) => {
    return await this.db.insert(messagesTable).values(messages).returning();
  };

  updateUser = async (email: string, data: any) => {
    await this.db
      .update(usersTable)
      .set(data)
      .where(eq(usersTable.email, email));
  };

  /**
   * Persist messages for a chat.
   * Strategy: delete existing messages for the chat, then bulk insert provided messages.
   * Each message object should contain: id (uuid), role, content, createdAt (Date or ISO string)
   */
  saveMessagesForChat = async (chatId: string, messages: any[]) => {
    // Remove existing messages for chat
    await this.db.delete(messagesTable).where(eq(messagesTable.chatId, chatId));

    if (!messages || messages.length === 0) return [];

    const rows = messages.map((m: any) => {
      const createdAt =
        m.createdAt && !(m.createdAt instanceof Date)
          ? new Date(m.createdAt)
          : m.createdAt ?? new Date();
      return {
        id: m.id,
        chatId,
        role: m.role,
        content:
          typeof m.content === 'string' ? m.content : JSON.stringify(m.content),
        createdAt,
      };
    });

    return await this.db.insert(messagesTable).values(rows).returning();
  };

  /**
   * Update a single message by id (if needed)
   */
  updateMessageById = async (id: string, data: any) => {
    return await this.db
      .update(messagesTable)
      .set(data)
      .where(eq(messagesTable.id, id));
  };
  transaction = <T>(callback: (tx: any) => Promise<T>, options?: any) => {
    return this.db.transaction(callback, options);
  };
}

export const db = new DB();
