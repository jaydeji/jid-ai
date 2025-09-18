import 'dotenv-defaults/config';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
  generateText,
  smoothStream,
  streamText,
  type UIMessage,
} from 'ai';
import { Hono } from 'hono';
import { proxy } from 'hono/proxy';
import { config } from '../config';
import { db } from '../db';
import { jwt, type JwtVariables } from 'hono/jwt';
import { getPayload } from '../helpers';
import { openrouter } from '../constants';
import { postChat } from '../services/chat';

type Variables = JwtVariables;
export const auth = new Hono<{ Variables: Variables }>();

auth.use(
  '*',
  jwt({
    secret: config.AUTH_TOKEN,
  })
);

auth.get('/models', async (c) => {
  const res = await proxy(`${config.OPEN_ROUTER_BASE_URL}/models`);

  res.headers.append('Cache-Control', 'public, max-age=3600');

  return res;
});

auth.get('/spend', async (c) => {
  try {
    const res = await proxy(`${config.REQUESTY_BASE_URL}/manage/apikey`, {
      headers: {
        Authorization: `Bearer ${config.REQUESTY_API_KEY}`,
      },
    });
    return res;
  } catch (error) {
    console.log(error);
  }
});

auth.get('/user', async (c) => {
  const userId = getPayload(c)?.sub;
  if (!userId) return c.json({}, 404);
  const { hashedPassword, ...user } = await db.getUserById(userId);
  return c.json(user);
});

auth.get('/chats', async (c) => {
  const userId = getPayload(c)?.sub;
  return c.json(await db.getChats(userId));
});

auth.get('/chats/:id', async (c) => {
  const id = c.req.param('id');
  const chat = await db.getMessagesByChatId(id);
  if (!chat) return c.json({}, 404);
  return c.json(chat);
});

auth.post('/chat/:id', async (c) => {
  const id = c.req.param('id');
  const { messages, model }: { messages: UIMessage[]; model: string } =
    await c.req.json();

  const result = streamText({
    // model: provider('openai/gpt-5-mini'),
    model: openrouter(model),
    // system: 'You are a helpful assistant.',
    messages: convertToModelMessages(messages),
    providerOptions: {
      openai: {
        reasoningEffort: 'high',
      },
    },
    experimental_transform: smoothStream({
      delayInMs: 20, // optional: defaults to 10ms
      chunking: 'line', // optional: defaults to 'word'
    }),
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      if (part.type === 'finish') {
        return {
          totalTokens: part.totalUsage.totalTokens,
        };
      }
    },
  });
});

auth.post('/chat', async (c) => {
  try {
    const userId = getPayload(c).sub;
    return postChat({ ...(await c.req.json()), userId });
  } catch ({ error, status }: any) {
    c.json({ error }, status);
  }
});
