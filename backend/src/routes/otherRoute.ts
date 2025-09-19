import 'dotenv-defaults/config';
import { Hono } from 'hono';
import { proxy } from 'hono/proxy';
import { config } from '../config';
import { db } from '../db';
import { type JwtVariables } from 'hono/jwt';
import { getPayload, jwtMiddleware } from '../helpers';

export const otherRoute = new Hono<{ Variables: JwtVariables }>();

otherRoute.get('/models', jwtMiddleware, async (c) => {
  try {
    const res = await proxy(`${config.OPEN_ROUTER_BASE_URL}/models`);
    res.headers.append('Cache-Control', 'public, max-age=3600');
    return res;
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

otherRoute.get('/spend', jwtMiddleware, async (c) => {
  try {
    const res = await proxy(`${config.REQUESTY_BASE_URL}/manage/apikey`, {
      headers: {
        Authorization: `Bearer ${config.REQUESTY_API_KEY}`,
      },
    });
    return res;
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});

otherRoute.get('/user', jwtMiddleware, async (c) => {
  try {
    const userId = getPayload(c)?.sub;
    if (!userId) return c.json({}, 404);
    const { hashedPassword, ...user } = await db.getUserById(userId);
    return c.json(user);
  } catch (error) {
    console.error(error);
    return c.json({ error: 'Internal Server Error' }, 500);
  }
});
