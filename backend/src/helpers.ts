import { sign } from 'hono/jwt';
import { cache } from './cache';
import { config } from './config';

export const getChatsById = (id: string) => {
  const chats: any[] = cache.getKey('chats');
  return chats.find((chat) => chat.id === id);
};

export const getUserById = (id: string) => {
  const users: any[] = cache.getKey('users');
  return users.find((user) => user.userId === id);
};

export const generateToken = async (user: any) => {
  const payload = {
    sub: user.email,
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + 60 * 60, // Token expires in 1 hr
  };

  const token = await sign(payload, config.AUTH_TOKEN);

  return token;
};
