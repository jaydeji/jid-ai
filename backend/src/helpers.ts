import { cache } from './cache.js';

export const getChatsById = (id: string) => {
  const chats: any[] = cache.getKey('chats');
  return chats.find((chat) => chat.id === id);
};
