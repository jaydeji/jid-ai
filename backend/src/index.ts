import 'dotenv-defaults/config';

import { serve } from '@hono/node-server';
import { Hono, type MiddlewareHandler } from 'hono';
import { cors } from 'hono/cors';
import { config } from './config';
import { errorHandler } from './exception';
import { authRoute, chatRoute, otherRoute } from './routes';
import { HTTPException } from 'hono/http-exception';
import { requestId } from 'hono/request-id';
import { logger } from './logger';

const pinoLoggerMiddleware = (): MiddlewareHandler => {
  return async function pinoLogger(c, next) {
    const requestId = c.var.requestId;
    const { method } = c.req;
    const path = new URL(c.req.url).pathname;

    // Log incoming request
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

    // Log outgoing response
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

const app = new Hono();

// important its before logger
app.use(requestId());

// app.use(honoLogger(customLogger));
// app.use(loggerMiddleware());
app.use(pinoLoggerMiddleware());

app.use(
  cors({
    origin: [config.CORS_ORIGIN], // Your frontend origin
    allowHeaders: ['Content-Type', 'Authorization'], // Allow these headers from the client
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
