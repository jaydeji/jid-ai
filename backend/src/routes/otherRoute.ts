import 'dotenv-defaults/config';
import { Hono } from 'hono';
import { proxy } from 'hono/proxy';
import { config } from '../config';
import { db } from '../db';
import { type JwtVariables } from 'hono/jwt';
import { filterModels, getPayload, jwtMiddleware } from '../helpers';
import { AppError } from '../exception';

export const otherRoute = new Hono<{ Variables: JwtVariables }>();

let lastModelFetchDate: Date | undefined;

let modelsCache: {
  filteredData: any;
  lastFetched: Date | null;
} = {
  filteredData: null,
  lastFetched: null,
};

otherRoute.get('/models', jwtMiddleware, async (c) => {
  const role = getPayload(c)?.role;

  const ONE_HOUR_MS = 60 * 60 * 1000; // 1 hour in mls
  const now = new Date();

  const isStale =
    !modelsCache.filteredData ||
    (modelsCache.lastFetched &&
      now.getTime() - modelsCache.lastFetched.getTime() > ONE_HOUR_MS);

  if (!isStale) {
    return new Response(JSON.stringify(modelsCache.filteredData), {
      status: 200,
      headers: {
        'Cache-Control': 'public, max-age=3600', //1 hr
        'X-Cache': 'HIT',
      },
    });
  }

  const res = await fetch(`${config.OPEN_ROUTER_BASE_URL}/models`);

  if (!res.ok) {
    throw new AppError('INTERNAL_ERROR');
  }

  const upstreamDateHeader = res.headers.get('Date') || '';

  let lastFetched = new Date(upstreamDateHeader);

  const rawData = await res.json();

  const filteredData = { data: filterModels(rawData.data, role) };

  // Update cache
  modelsCache = {
    filteredData,
    lastFetched,
  };

  return c.json(filteredData, 200, {
    'Content-Type': 'application/json',
    'Cache-Control': 'public, max-age=3600', // 1hr
    'X-Cache': 'MISS',
  });
});

// otherRoute.get('/spend', jwtMiddleware, async (c) => {
//   try {
//     const res = await proxy(`${config.REQUESTY_BASE_URL}/manage/apikey`, {
//       headers: {
//         Authorization: `Bearer ${config.REQUESTY_API_KEY}`,
//       },
//     });
//     return res;
//   } catch (error) {
//     throw new AppError('INTERNAL_ERROR');
//   }
// });

otherRoute.get('/user', jwtMiddleware, async (c) => {
  const userId = getPayload(c)?.sub;
  if (!userId) return c.json({}, 404);
  const { hashedPassword, ...user } = await db.getUserById(userId);
  return c.json(user);
});
