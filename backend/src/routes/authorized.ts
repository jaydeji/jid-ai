import 'dotenv-defaults/config';
import { Hono } from 'hono';
import { proxy } from 'hono/proxy';
import { config } from '../config';
import { db } from '../db';
import { jwt, type JwtVariables } from 'hono/jwt';
import { getPayload } from '../helpers';
import { postChat } from '../services/chat';

type Variables = JwtVariables;
export const auth = new Hono<{ Variables: Variables }>();

auth.use(
  '*',
  jwt({
    secret: config.AUTH_TOKEN,
  })
);

auth.get('/models', async (c) => {
  try {
    const res = await proxy(`${config.OPEN_ROUTER_BASE_URL}/models`);
    res.headers.append('Cache-Control', 'public, max-age=3600');
    return res;
  } catch (error) {
    console.error(error);
    c.json({ error: 'Internal Server Error' }, 500);
  }
});

auth.get('/spend', async (c) => {
  try {
    const res = await proxy(`${config.REQUESTY_BASE_URL}/manage/apikey`, {
      headers: {
        Authorization: `Bearer ${config.REQUESTY_API_KEY}`,
      },
    });
    return res;
  } catch (error) {
    console.error(error);
    c.json({ error: 'Internal Server Error' }, 500);
  }
});

auth.get('/user', async (c) => {
  try {
    const userId = getPayload(c)?.sub;
    if (!userId) return c.json({}, 404);
    const { hashedPassword, ...user } = await db.getUserById(userId);
    return c.json(user);
  } catch (error) {
    console.error(error);
    c.json({ error: 'Internal Server Error' }, 500);
  }
});

auth.get('/chats', async (c) => {
  try {
    const userId = getPayload(c)?.sub;
    return c.json(await db.getChats(userId));
  } catch (error) {
    console.error(error);
    c.json({ error: 'Internal Server Error' }, 500);
  }
});

auth.get('/chats/:id', async (c) => {
  try {
    const id = c.req.param('id');
    const chat = await db.getMessagesByChatId(id);
    if (!chat) return c.json({}, 404);
    return c.json(chat);
  } catch (error) {
    console.error(error);
    c.json({ error: 'Internal Server Error' }, 500);
  }
});

auth.post('/chat', async (c) => {
  try {
    const userId = getPayload(c).sub;
    return postChat({ ...(await c.req.json()), userId });
  } catch ({ error, status }: any) {
    console.error(error);
    c.json({ error }, status);
  }
});
