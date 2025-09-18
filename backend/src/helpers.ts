import { sign } from 'hono/jwt';
import { config } from './config';
import type { Context } from 'hono';
import { usersTable } from './schema';
import { generateText } from 'ai';
import { openrouter } from './constants';

export const generateToken = async (user: any) => {
  const payload = {
    sub: user.userId,
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3, // Token expires in 3 hrs
  };

  const token = await sign(payload, config.AUTH_TOKEN);

  return token;
};

export const getPayload = (c: Context) => {
  try {
    const jwtPayload = c.get('jwtPayload') as any;
    return jwtPayload;
  } catch (error) {
    console.log(error);
  }
};
