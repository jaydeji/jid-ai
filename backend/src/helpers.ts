import { cache } from './cache';

export const getChatsById = (id: string) => {
  const chats: any[] = cache.getKey('chats');
  return chats.find((chat) => chat.id === id);
};

export const getUserById = (id: string) => {
  const users: any[] = cache.getKey('users');
  return users.find((user) => user.userId === id);
};
