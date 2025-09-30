import 'dotenv-defaults/config';
import { Hono } from 'hono';
import { db } from '../db';
import { type JwtVariables } from 'hono/jwt';
import { getPayload, jwtMiddleware } from '../helpers';
import { postChat } from '../services/chatService';
import { AppError } from '../exception';

export const chatRoute = new Hono<{ Variables: JwtVariables }>();

chatRoute.get('/chats', jwtMiddleware, async (c) => {
  const userId = getPayload(c)?.sub;
  return c.json(await db.getChats(userId));
});

chatRoute.get('/chats/:id', jwtMiddleware, async (c) => {
  const id = c.req.param('id');
  const chat = await db.getMessagesByChatId(id);
  if (!chat) return c.json({}, 404);
  return c.json(chat);
});

chatRoute.post('/chat', jwtMiddleware, async (c) => {
  const userId = getPayload(c).sub;
  const abortSignal = c.req.raw.signal;
  return postChat({ ...(await c.req.json()), userId, abortSignal });
});
