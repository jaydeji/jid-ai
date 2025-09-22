import 'dotenv-defaults/config';
import { Hono } from 'hono';
import { signIn, signUp } from '../services/authService';

export const authRoute = new Hono();

authRoute.post('/signup', async (c) => {
  const user = await c.req.json();
  return c.json(await signUp(user));
});

authRoute.post('/signin', async (c) => {
  const user = await c.req.json();
  return c.json(await signIn(user));
});

// authRoute.get('/', async (c) => {
//   const x = await getStats('gen-1758261973-SUodVR1KlTXZ3ipd6hub');
//   const { total_cost, usage } = x;
//   return c.json({ total_cost, usage });
// });
