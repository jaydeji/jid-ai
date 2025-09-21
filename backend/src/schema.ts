import { UIMessage } from 'ai';
import { relations, sql } from 'drizzle-orm';
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
  index,
  numeric,
  decimal,
} from 'drizzle-orm/pg-core';

// Users
export const usersTable = pgTable(
  'users',
  {
    userId: uuid('user_id')
      .default(sql`gen_random_uuid()`)
      .primaryKey(),
    firstName: varchar('first_name', { length: 256 }).notNull(),
    lastName: varchar('last_name', { length: 256 }).notNull(),
    email: varchar('email', { length: 256 }).notNull().unique(),
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
    credits: decimal('input_cost', { precision: 15, scale: 9 })
      .notNull()
      .default('0'),
    hashedPassword: text('hashed_password').notNull(),
    role: varchar('role', { length: 50 })
      .$type<'user' | 'admin'>()
      .default('user')
      .notNull(),
  },
  (table) => [index('email_idx').on(table.email)]
);

// Chats
export const chatsTable = pgTable('chats', {
  id: uuid('id').defaultRandom().primaryKey(),
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
    .default('pending')
    .notNull(),
  // Optional self reference to a parent chat
  branchParent: uuid('branch_parent'),
  pinned: boolean('pinned').default(false).notNull(),
  userSetTitle: boolean('user_set_title').default(false).notNull(),
  userId: uuid('user_id')
    .references(() => usersTable.userId, {
      onDelete: 'cascade',
    })
    .notNull(),
  inputTokens: integer('input_tokens').default(0),
  outputTokens: integer('output_tokens').default(0),
  totalTokens: integer('total_tokens').default(0),
  inputCost: decimal('input_cost', { precision: 15, scale: 9 }).default('0'),
  outputCost: decimal('output_cost', { precision: 15, scale: 9 }).default('0'),
  totalCost: decimal('total_cost', { precision: 15, scale: 9 }).default('0'),
  metadata: jsonb('metadata').$type<{
    finishReason?: string;
    toolCalls?: Array<{
      id: string;
      name: string;
      args: Record<string, any>;
    }>;
    [key: string]: any;
  }>(),
});

// Messages
export const messagesTable = pgTable('messages', {
  id: uuid('id').defaultRandom().primaryKey(),
  chatId: uuid('chat_id')
    .references(() => chatsTable.id, { onDelete: 'cascade' })
    .notNull(),
  role: varchar('role', { length: 20 }).$type<UIMessage['role']>().notNull(),
  parts: jsonb('content').$type<UIMessage['parts']>().notNull(),

  createdAt: timestamp('created_at', { withTimezone: true })
    .defaultNow()
    .notNull(),
  model: varchar('model', { length: 100 }).notNull(),
});

// Relations

export const usersRelations = relations(usersTable, ({ many }) => ({
  chats: many(chatsTable),
}));

export const chatsRelations = relations(chatsTable, ({ one, many }) => ({
  user: one(usersTable, {
    fields: [chatsTable.userId],
    references: [usersTable.userId],
  }),
  messages: many(messagesTable),

  // Self relation: a chat can have a parent and many children
  parent: one(chatsTable, {
    fields: [chatsTable.branchParent],
    references: [chatsTable.id],
    relationName: 'chatParent',
  }),
  children: many(chatsTable, { relationName: 'chatParent' }),
}));

export const messagesRelations = relations(messagesTable, ({ one }) => ({
  chat: one(chatsTable, {
    fields: [messagesTable.chatId],
    references: [chatsTable.id],
  }),
}));
