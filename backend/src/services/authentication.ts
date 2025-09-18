import 'dotenv-defaults/config';
import { generateToken } from '../helpers';
import { db } from '../db';
import { userSignUpSchema, userSignInSchema } from '../schemas/user';
import { HTTPException } from 'hono/http-exception';
import bcrypt from 'bcrypt';
import { consts } from '../constants';

export const signIn = async (user: any) => {
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

  return { user, token: await generateToken(parsedUser) };
};

export const signUp = async (user: any) => {
  let parsedUser;

  try {
    parsedUser = userSignUpSchema.parse(user);
  } catch (error) {
    console.error('Validation Error:', error);
    throw new HTTPException(400, { message: 'Bad user', cause: error });
  }

  const hp = await bcrypt.hash(parsedUser.password, consts.SALT_ROUNDS);

  const { password, ...passwordUser } = parsedUser;

  (passwordUser as any).hashedPassword = hp;

  let savedUser;

  try {
    savedUser = await db.addUser(passwordUser);
    console.log('Successfully saved user');
  } catch (error) {
    console.log(error);
  }

  const { hashedPassword, ...returnedUser } = savedUser!;

  return { user, token: await generateToken(returnedUser) };
};
