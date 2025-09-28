import pino from 'pino';
import { config } from './config';
import type { PrettyOptions } from 'pino-pretty';

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

export const logger = pino(options);
