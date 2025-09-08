import 'dotenv-defaults/config';

import { serve } from '@hono/node-server';
import { convertToModelMessages, streamText, type UIMessage } from 'ai';
import { Hono } from 'hono';
import { cors } from 'hono/cors';
import { proxy } from 'hono/proxy';
import { createOpenAICompatible } from '@ai-sdk/openai-compatible';
import { config } from './config.js';

const chats: any = [
  // {
  //   id: 'jd73rkn1esb5an5cesjwm38txn7q7a2n',
  //   branchParent: null,
  //   createdAt: 1757313146055,
  //   generationStatus: 'completed',
  //   lastMessageAt: 1757314442518,
  //   model: 'gpt-5-mini',
  //   pinned: false,
  //   threadId: '5e9c32dc-d336-45a9-bd02-fe2cadfe1ca7',
  //   title: 'Adding Search Functionality to React Component with Dropdown Menu',
  //   updatedAt: 1757314442518,
  //   userSetTitle: false,
  // },
];

const user = {
  userId: 'google:110510818893952848592',
  userName: 'Babajide',
  email: 'jyde.dev@gmail.com',
  avatar: '',
  additionalInfo:
    'Never use this symbol "—". Don’t reference my occupation unless absolutely necessary',
  currentModelParameters: {
    includeSearch: true,
    reasoningEffort: 'high',
  },
  currentlySelectedModel: 'openai/gpt-5-mini:flex',
  disableExternalLinkWarning: true,
  favoriteModels: ['gemini-2.5-flash', 'gpt-5-chat'],
};

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
  return c.json(user);
});

app.get('/chats', (c) => {
  return c.json(chats);
});

app.post('/chat', async (c) => {
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

serve(
  {
    fetch: app.fetch,
    port: 3001,
  },
  (info) => {
    console.log(`Server is running on http://localhost:${info.port}`);
  }
);
