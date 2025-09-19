import 'dotenv-defaults/config';
import { Hono } from 'hono';
import { signIn, signUp } from '../services/authentication';
import { getStats } from '../services/chatService';
import { AppError } from '../exception';

export const authRoute = new Hono();

authRoute.post('/signup', async (c) => {
  try {
    const user = await c.req.json();
    return c.json(await signUp(user));
  } catch ({ error, status }: any) {
    console.error(error);
    return c.json({ error }, status);
  }
});

authRoute.post('/signin', async (c) => {
  try {
    const user = await c.req.json();
    return c.json(await signIn(user));
  } catch ({ error, status }: any) {
    console.error(error);
    return c.json({ error }, status);
  }
});

authRoute.get('/', async (c) => {
  const x = await getStats('0acc67fb-bd5f-4b99-bed3-237d65920314');
  console.log(x);
  return c.text('Hello Hono!');
});
