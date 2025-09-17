import 'dotenv-defaults/config';
import {
  convertToModelMessages,
  createIdGenerator,
  smoothStream,
  streamText,
  type UIMessage,
} from 'ai';
import { Hono } from 'hono';
import { proxy } from 'hono/proxy';
import { config } from '../config';
import { cache } from '../cache';
import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { db } from '../db';
import { jwt, type JwtVariables } from 'hono/jwt';

const openrouter = createOpenRouter({
  apiKey: config.OPEN_ROUTER_API_KEY,
});

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
  const { email } = c.get('jwtPayload');
  const user = await db.getUserByemail(email);
  return c.json(user);
});

auth.get('/chats', (c) => {
  const chats: any[] = cache.getKey('chats');
  return c.json(chats.map((e) => ({ id: e.id, title: e.title })));
});

auth.get('/chats/:id', async (c) => {
  const id = c.req.param('id');
  const chat = await db.getChatById(id);
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
  const {
    messages,
    model,
    chatId,
  }: { messages: UIMessage[]; model: string; chatId: string } =
    await c.req.json();

  let chat = await db.getChatById(chatId);
  let chatExists = !!chat;
  const now = new Date();

  if (chatExists) {
    chat.updatedAt = now;
    chat.messages.push(...messages);
  } else {
    chat = {
      id: chatId,
      createdAt: now,
      updatedAt: now,
      title: 'New Chat',
      model,
      generationStatus: 'completed',
      branchParent: null,
      pinned: false,
      //   threadId: '5e9c32dc-d336-45a9-bd02-fe2cadfe1ca7',
      userSetTitle: false,
      messages: [...messages],
    };
  }

  // console.log(convertToModelMessages(messages));//[ { role: 'user', content: [ [Object] ] } ]

  // chats[chatId] = chat;

  const result = streamText({
    // model: provider('openai/gpt-5-mini'),
    model: openrouter(model),
    // system: 'You are a helpful assistant.',
    messages: convertToModelMessages(chat.messages),
    providerOptions: {
      openai: {
        reasoningEffort: 'high', // make dynamic
      },
    },
  });

  return result.toUIMessageStreamResponse({
    messageMetadata: ({ part }) => {
      if (part.type === 'finish') {
        return {
          totalTokens: part.totalUsage.totalTokens,
        };
      }
    },
    originalMessages: messages,
    generateMessageId: createIdGenerator({
      // prefix: 'msg',
      size: 16,
    }),
    onFinish: ({ messages }) => {
      chat.updatedAt = Date.now();

      const chats: any[] = cache.getKey('chats');

      chat.messages = messages;

      if (chatExists) {
        const chatIndex = chats.findIndex((chat) => chat.id === chatId);
        chats[chatIndex] = chat;
      } else {
        // chat.generationStatus = 'completed';
        chats.unshift(chat);
      }

      const users: any[] = cache.getKey('users');
      const usersIndex = users.findIndex(
        (user) => user.userId === 'google:110510818893952848592'
      );
      users[usersIndex].currentlySelectedModel = model;

      cache.setKey('chats', chats);
      cache.setKey('users', users);
      cache.save();
    },
  });
});
