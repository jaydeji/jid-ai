import { jwt, sign } from 'hono/jwt';
import { config } from './config';
import { type Context } from 'hono';
import { AppError } from './exception';
import { logger } from './logger';
import { openrouter } from './constants';
import { AnyColumn, sql } from 'drizzle-orm';
import { User } from './schemas/types';
import { ModelParameters, OpenRouterModelInfo, UserRole } from './types';

export const generateToken = async (user: User) => {
  const payload = {
    sub: user.userId,
    role: user.role,
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 72, // Token expires in 3 days
  };

  const token = await sign(payload, config.AUTH_TOKEN);

  return token;
};

export const getPayload = (c: Context) => {
  try {
    const jwtPayload = c.get('jwtPayload') as any;
    return jwtPayload;
  } catch (error) {
    throw new AppError('INTERNAL_ERROR', error);
  }
};

export const jwtMiddleware = jwt({
  secret: config.AUTH_TOKEN,
});

export const getModel = ({
  model,
  userId,
  modelParameters = null,
}: {
  model: string;
  userId?: string;
  modelParameters?: ModelParameters | null;
}) => {
  let m = model;

  if (modelParameters?.includeSearch) {
    m += ':online';
  }

  return openrouter(m, {
    usage: { include: true },
    user: userId,
    reasoning: {
      effort: 'low',
    },
  });
};

export const decrement = (column: AnyColumn, value = 1) => {
  return sql`${column} - ${value}`;
};

export const increment = (column: AnyColumn, value = 1) => {
  return sql`${column} + ${value}`;
};

export const filterModels = (
  models: OpenRouterModelInfo[],
  role: UserRole
): OpenRouterModelInfo[] => {
  if (role === 'admin') return models;
  return models.filter(
    (e) => e.id !== 'openrouter/auto' && !e.id.includes(':free')
  );
};
