import pino from 'pino';
import { config } from './config';
import type { PrettyOptions } from 'pino-pretty';
import type { MiddlewareHandler } from 'hono';

const options: pino.LoggerOptions = {
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  redact: {
    paths: ['password', 'user.password'],
    censor: '[REDACTED]',
  },
  ...(config.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: `UTC:yyyy-mm-dd'T'HH:MM:ss'Z'`, //isoUtcDateTime
        ignore: 'pid,hostname',
      } as PrettyOptions,
    },
  }),
};

export const pinoLoggerMiddleware = (): MiddlewareHandler => {
  return async function pinoLogger(c, next) {
    const requestId = c.var.requestId;
    const { method } = c.req;
    const path = new URL(c.req.url).pathname;

    logger.info({
      requestId,
      method,
      path,
      type: 'request',
    });

    const start = Date.now();

    await next();

    const duration = Date.now() - start;
    const status = c.res.status;

    const logLevel = status >= 400 ? 'error' : status >= 300 ? 'warn' : 'info';

    logger[logLevel]({
      requestId,
      method,
      path,
      status,
      duration: `${duration}ms`,
      type: 'response',
    });
  };
};

export const logger = pino(options);
