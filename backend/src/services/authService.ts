import 'dotenv-defaults/config';
import { generateToken } from '../helpers';
import { db } from '../db';
import { userSignUpSchema, userSignInSchema } from '../schemas/user';
import { HTTPException } from 'hono/http-exception';
import bcrypt from 'bcrypt';
import { consts } from '../constants';
import { AppError } from '../exception';
import { logger } from '../logger';

export const signIn = async (user: any) => {
  let parsedUser;

  try {
    parsedUser = userSignInSchema.parse(user);
  } catch (error) {
    throw new AppError('BAD_REQUEST');
  }

  parsedUser = await db.getUserByemail(parsedUser.email);

  const isMatch = await bcrypt.compare(
    user.password,
    parsedUser.hashedPassword
  );

  if (!isMatch) {
    logger.error({ id: user.userId });
    throw new AppError('USER_NOT_FOUND');
  }

  return { user, token: await generateToken(parsedUser) };
};

export const signUp = async (user: any) => {
  let parsedUser;

  try {
    parsedUser = userSignUpSchema.parse(user);
  } catch (error) {
    throw new AppError('BAD_REQUEST');
  }

  const hp = await bcrypt.hash(parsedUser.password, consts.SALT_ROUNDS);

  const { password, ...passwordUser } = parsedUser;

  (passwordUser as any).hashedPassword = hp;

  let savedUser;

  savedUser = await db.addUser(passwordUser);

  const { hashedPassword, ...returnedUser } = savedUser!;

  return { user, token: await generateToken(returnedUser) };
};
