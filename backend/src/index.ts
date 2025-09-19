import 'dotenv-defaults/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { config } from './config';
import { logger } from 'hono/logger';
import { AppError, errorHandler } from './exception';
import { authRoute, chatRoute, otherRoute } from './routes';
import { HTTPException } from 'hono/http-exception';

const app = new Hono();

// app.use(logger());

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
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
