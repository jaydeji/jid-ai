import 'dotenv-defaults/config';

import { serve } from '@hono/node-server';
import {
  convertToModelMessages,
  createIdGenerator,
  generateId,
  streamText,
  type UIMessage,
} from 'ai';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { config } from './config.js';
import { cache } from './cache.js';

const provider = createOpenAICompatible({
  name: 'provider-name',
  apiKey: config.REQUESTY_API_KEY,
  baseURL: config.REQUESTY_BASE_URL,
  includeUsage: true, // Include usage information in streaming responses
});

const app = new Hono();

app.use(cors());

app.get('/models', async (c) => {
  const res = await proxy(`${config.REQUESTY_BASE_URL}/models`);

  res.headers.append('Cache-Control', 'public, max-age=3600');

  return res;
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
  const chats: any[] = cache.getKey('chats');
  return c.json(chats.find((chat) => chat.id === id));
});

app.post('/chat/:id', async (c) => {
  const id = c.req.param('id');
  const { messages, model }: { messages: UIMessage[]; model: string } =
    await c.req.json();

  const result = streamText({
    // model: provider('openai/gpt-5-mini'),
    model: provider(model),
    // system: 'You are a helpful assistant.',
    messages: convertToModelMessages(messages),
    providerOptions: {
      openai: {
        reasoningEffort: 'high',
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
  });
});

app.post('/chat', async (c) => {
  const { messages, model }: { messages: UIMessage[]; model: string } =
    await c.req.json();

  const now = Date.now();

  const chat: any = {
    id: generateId(),
    createdAt: now,
    updatedAt: now,
    lastMessageAt: now,
    title: 'New Chat',
    model,
    generationStatus: 'completed',
    branchParent: null,
    pinned: false,
    //   threadId: '5e9c32dc-d336-45a9-bd02-fe2cadfe1ca7',
    userSetTitle: false,
    messages: [...messages],
  };

  // console.log(convertToModelMessages(messages));//[ { role: 'user', content: [ [Object] ] } ]

  // chats[chatId] = chat;

  const result = streamText({
    // model: provider('openai/gpt-5-mini'),
    model: provider(model),
    // system: 'You are a helpful assistant.',
    messages: convertToModelMessages(messages),
    providerOptions: {
      openai: {
        reasoningEffort: 'high',
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
      chat.lastMessageAt = Date.now();
      chat.messages = messages;
      // chat.generationStatus = 'completed';
      const chats: any[] = cache.getKey('chats');
      chats.unshift(chat);
      cache.setKey('chats', chats);
      // console.log(chats);
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
