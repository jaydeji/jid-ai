import 'dotenv-defaults/config';

import { serve } from '@hono/node-server';
import { Hono, type MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';
import { config } from './config';
import { errorHandler } from './exception';
import { authRoute, chatRoute, otherRoute } from './routes';
import { HTTPException } from 'hono/http-exception';
import { requestId } from 'hono/request-id';
import { logger, pinoLoggerMiddleware } from './logger';
import { compress } from 'hono/compress';

const app = new Hono();

app.use(compress());

// important its before logger middleware
app.use(requestId());

app.use(pinoLoggerMiddleware());

app.use(
  cors({
    origin: config.CORS_ORIGIN, // Your frontend origin
    allowHeaders: ['Content-Type', 'Authorization', 'User-Agent'], // Allow these headers from the client
    credentials: true, // Allow cookies, authorization headers, etc.
  })
);

app.route('/', authRoute);
app.route('/', chatRoute);
app.route('/', otherRoute);

app.notFound(() => {
  throw new HTTPException(404, { message: 'Not Found' });
});

app.onError(errorHandler);

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    logger.info(`Server is running on http://localhost:${info.port}`);
  }
);

// Global error handlers to prevent crashes from uncaught async errors
process.on('unhandledRejection', (error) => {
  logger.error(error);
});

process.on('uncaughtException', (error) => {
  logger.error(error);
  // process.exit(1); // Optional: exit if critical, or just log
});
