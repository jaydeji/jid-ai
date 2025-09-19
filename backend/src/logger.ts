import pino from 'pino';
import { config } from './config';

const options = {
  level: config.NODE_ENV === 'production' ? 'info' : 'debug',
  ...(config.NODE_ENV !== 'production' && {
    transport: {
      target: 'pino-pretty',
      options: {
        colorize: true,
        translateTime: `UTC:yyyy-mm-dd'T'HH:MM:ss'Z'`, //isoUtcDateTime
        ignore: 'pid,hostname',
      },
    },
  }),
};

export const logger = pino(options);
