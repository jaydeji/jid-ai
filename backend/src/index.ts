import 'dotenv-defaults/config.js';

import { serve } from '@hono/node-server';
import {
  convertToModelMessages,
  createIdGenerator,
  smoothStream,
  streamText,
  type UIMessage,
} from 'ai';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { config } from './config.js';
import { cache } from './cache.js';
import { getChatsById, getUserById } from './helpers.js';
import { basicAuth } from 'hono/basic-auth';

import { createOpenRouter } from '@openrouter/ai-sdk-provider';

const openrouter = createOpenRouter({
  apiKey: config.OPEN_ROUTER_API_KEY,
});

const app = new Hono();

app.use(cors());

app.use(
  '*',
  basicAuth({
    username: 'test1@gmail.com',
    password: config.AUTH_PASS,
  })
);

app.get('/models', async (c) => {
  const res = await proxy(`${config.OPEN_ROUTER_BASE_URL}/models`);

  res.headers.append('Cache-Control', 'public, max-age=3600');

  return res;
});

app.get('/spend', async (c) => {
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

app.get('/', (c) => {
  return c.text('Hello Hono!');
});

app.get('/user', (c) => {
  const user = cache.getKey<any[]>('users')[0];
  return c.json(user);
});

app.get('/chats', (c) => {
  const chats: any[] = cache.getKey('chats');
  return c.json(chats.map((e) => ({ id: e.id, title: e.title })));
});

app.get('/chats/:id', (c) => {
  const id = c.req.param('id');
  const chat = getChatsById(id);
  if (!chat) return c.json({}, 404);
  return c.json(chat);
});

app.post('/chat/:id', async (c) => {
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

app.post('/chat', async (c) => {
  const {
    messages,
    model,
    chatId,
  }: { messages: UIMessage[]; model: string; chatId: string } =
    await c.req.json();

  let chat = getChatsById(chatId);
  let chatExists = !!chat;
  const now = Date.now();

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

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
