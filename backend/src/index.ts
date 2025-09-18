import 'dotenv-defaults/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './routes/authorized';
import { nonAuth } from './routes/nonAuthorized';
import { config } from './config';

const app = new Hono();

app.use(
  cors({
    origin: [config.CORS_ORIGIN], // Your frontend origin
    allowHeaders: ['Content-Type', 'Authorization'], // Allow these headers from the client
    credentials: true, // Allow cookies, authorization headers, etc.
  })
);

app.route('/', nonAuth);
app.route('/', auth);

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
