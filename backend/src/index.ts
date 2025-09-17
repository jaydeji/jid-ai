import 'dotenv-defaults/config';

import { serve } from '@hono/node-server';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { auth } from './routes/auth';
import { nonAuth } from './routes/nonAuth';

const app = new Hono();

app.use(cors());

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
