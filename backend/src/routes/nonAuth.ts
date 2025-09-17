import 'dotenv-defaults/config';
import { Hono } from 'hono';
import { generateToken } from '../helpers';
import { db } from '../db';
import { userSignUpSchema, userSignInSchema } from '../schemas/user';
import { HTTPException } from 'hono/http-exception';
import bcrypt from 'bcrypt';
import { consts } from '../constants';

export const nonAuth = new Hono();

nonAuth.post('/signup', async (c) => {
  const { user }: { user: any } = await c.req.json();

  let parsedUser;

  try {
    parsedUser = userSignUpSchema.parse(user);
  } catch (error) {
    console.error('Validation Error:', error);
    throw new HTTPException(400, { message: 'Bad user', cause: error });
  }

  const hashedPassword = await bcrypt.hash(
    parsedUser.password,
    consts.SALT_ROUNDS
  );

  const { password, ...passwordUser } = parsedUser;

  (passwordUser as any).hashedPassword = hashedPassword;

  let savedUser;

  try {
    savedUser = await db.addUser(passwordUser);
    console.log(savedUser);
  } catch (error) {
    console.log(error);
  }

  c.json({ user, token: await generateToken(user) });
});

nonAuth.post('/signin', async (c) => {
  const { user }: { user: any } = await c.req.json();

  let parsedUser;

  try {
    parsedUser = userSignInSchema.parse(user);
  } catch (error) {
    console.error('Validation Error:', error);
    throw new HTTPException(400, { message: 'Bad signin', cause: error });
  }

  try {
    parsedUser = await db.getUserByemail(parsedUser.email);
  } catch (error) {
    console.error('Validation Error:', error);
    throw new HTTPException(404, { message: 'User not found' });
  }

  const isMatch = await bcrypt.compare(
    user.password,
    parsedUser.hashedPassword
  );

  if (!isMatch) {
    throw new HTTPException(404, { message: 'User not found' });
  }

  c.json({ user, token: await generateToken(user) });
});

nonAuth.get('/', async (c) => {
  // try {
  //   // Run a simple query
  //   const result = await db.select().from(usersTable);
  //   console.log('✅ Connection OK:', result);
  // } catch (err) {
  //   console.error('❌ Connection failed:', err);
  // }
  return c.text('Hello Hono!');
});
// user.get('/', (c) => c.text('List Users')) // GET /user
// user.post('/', (c) => c.text('Create User')) // POST /user
