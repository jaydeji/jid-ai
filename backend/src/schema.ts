import { sql } from 'drizzle-orm';
import {
  pgTable,
  text,
  jsonb,
  varchar,
  integer,
  uniqueIndex,
  uuid,
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
  },
  (table) => {
    return {
      emailIdx: uniqueIndex('email_idx').on(table.email), // Added unique index
    };
  }
);
