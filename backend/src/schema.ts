import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  jsonb,
  varchar,
  integer,
  uniqueIndex,
  uuid,
  timestamp,
  boolean,
} from 'drizzle-orm/pg-core';

export const usersTable = pgTable(
  'users',
  {
    userId: uuid('user_id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    firstName: varchar('first_name', { length: 256 }).notNull(),
    lastName: varchar('last_name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull().unique(), // Added unique() constraint
    avatar: text('avatar'),
    additionalInfo: text('additional_info'),
    currentModelParameters: jsonb('current_model_parameters').$type<{
      includeSearch: boolean;
      reasoningEffort: 'low' | 'medium' | 'high';
    }>(),
    currentlySelectedModel: varchar('currently_selected_model', {
      length: 256,
    }),
    favoriteModels: jsonb('favorite_models').$type<string[]>(),
    aiCreditsCents: integer('ai_credits_cents').default(0).notNull(),
    hashedPassword: text('hashed_password').notNull(),
  },
  (table) => {
    return {
      emailIdx: uniqueIndex('email_idx').on(table.email), // Added unique index
    };
  }
);

export const chatsTable = pgTable('chats', {
  id: uuid('id').defaultRandom().primaryKey(), // chatId
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  title: varchar('title', { length: 255 }).default('New Chat').notNull(),
  model: varchar('model', { length: 100 }).notNull(),
  generationStatus: varchar('generation_status', { length: 50 })
    .$type<'completed' | 'pending' | 'failed'>()
    .default('completed')
    .notNull(),
  branchParent: uuid('branch_parent'), // can be null
  pinned: boolean('pinned').default(false).notNull(),
  // threadId: uuid("thread_id"), // uncomment if you need thread relation
  userSetTitle: boolean('user_set_title').default(false).notNull(),
});

// -- Message table (separate, since messages are array-like)
export const messagesTable = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  chatId: uuid('chat_id')
    .references(() => chatsTable.id, { onDelete: 'cascade' })
    .notNull(),
  role: varchar('role', { length: 20 }).notNull(), // e.g. user, assistant, system
  content: text('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
});
