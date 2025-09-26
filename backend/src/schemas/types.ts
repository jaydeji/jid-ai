import { chatsTable, usersTable } from './schema';

export type UserWithPass = typeof usersTable.$inferSelect;
export type User = Omit<UserWithPass, 'hashedPassword'>;
export type UpdateUser = typeof usersTable.$inferSelect;
export type CreateChat = typeof chatsTable.$inferInsert;
