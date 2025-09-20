import { jwt, sign } from 'hono/jwt';
import { config } from './config';
import { type Context } from 'hono';
import { AppError } from './exception';
import { logger } from './logger';

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
