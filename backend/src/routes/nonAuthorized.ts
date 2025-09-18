import 'dotenv-defaults/config';
import { Hono } from 'hono';
import { signIn, signUp } from '../services/authentication';

export const nonAuth = new Hono();

nonAuth.post('/signup', async (c) => {
  try {
    const user = await c.req.json();
    c.json(await signUp(user));
  } catch ({ error, status }: any) {
    console.error(error);
    c.json({ error }, status);
  }
});

nonAuth.post('/signin', async (c) => {
  try {
    const user = await c.req.json();
    c.json(await signIn(user));
  } catch ({ error, status }: any) {
    console.error(error);
    c.json({ error }, status);
  }
});

nonAuth.get('/', async (c) => {
  return c.text('Hello Hono!');
});
