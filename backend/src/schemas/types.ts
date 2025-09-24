import { usersTable } from './schema';

export type UserWithPass = typeof usersTable.$inferSelect;
export type User = Omit<UserWithPass, 'hashedPassword'>;
