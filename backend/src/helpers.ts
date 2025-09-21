import { jwt, sign } from 'hono/jwt';
import { config } from './config';
import { type Context } from 'hono';
import { AppError } from './exception';
import { logger } from './logger';
import { openrouter } from './constants';
import { AnyColumn, sql } from 'drizzle-orm';

export const generateToken = async (user: any) => {
  const payload = {
    sub: user.userId,
    role: 'user',
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
    logger.error('Error parsing jwt');
    throw new AppError('INTERNAL_ERROR');
  }
};

export const jwtMiddleware = jwt({
  secret: config.AUTH_TOKEN,
});

export const getModel = ({
  model,
  userId,
}: {
  model: string;
  userId?: string;
}) => {
  return openrouter(model, { usage: { include: true }, user: userId });
};

export const decrement = (column: AnyColumn, value = 1) => {
  return sql`${column} - ${value}`;
};

export const increment = (column: AnyColumn, value = 1) => {
  return sql`${column} + ${value}`;
};
