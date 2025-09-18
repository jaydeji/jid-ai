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
    throw { error: 'Bad signin', status: 400 };
  }

  try {
    parsedUser = await db.getUserByemail(parsedUser.email);
  } catch (error) {
    console.error('Validation Error:', error);
    throw { error: 'User not found', status: 404 };
  }

  const isMatch = await bcrypt.compare(
    user.password,
    parsedUser.hashedPassword
  );

  if (!isMatch) {
    throw { error: 'User not found', status: 404 };
  }

  return { user, token: await generateToken(parsedUser) };
};

export const signUp = async (user: any) => {
  let parsedUser;

  try {
    parsedUser = userSignUpSchema.parse(user);
  } catch (error) {
    console.error('Validation Error:', error);
    throw { error: 'Bad user', status: 400 };
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
