import 'dotenv-defaults/config';
import { Hono } from 'hono';
import { db } from '../db';
import { type JwtVariables } from 'hono/jwt';
import { getPayload, jwtMiddleware } from '../helpers';
import { postChat } from '../services/chatService';

export const chatRoute = new Hono<{ Variables: JwtVariables }>();

chatRoute.get('/chats', jwtMiddleware, async (c) => {
  try {
    const userId = getPayload(c)?.sub;
    return c.json(await db.getChats(userId));
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

chatRoute.get('/chats/:id', jwtMiddleware, async (c) => {
  try {
    const id = c.req.param('id');
    const chat = await db.getMessagesByChatId(id);
    if (!chat) return c.json({}, 404);
    return c.json(chat);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

chatRoute.post('/chat', jwtMiddleware, async (c) => {
  try {
    const userId = getPayload(c).sub;
    return postChat({ ...(await c.req.json()), userId });
  } catch ({ error, status }: any) {
    console.error(error);
    return c.json({ error }, status);
  }
});
