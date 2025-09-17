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
import { getPayload } from '../helpers';

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
  // jwt payload may provide the subject as `sub` (where we store the email)
  // or an `email` field depending on how the token was generated.
  const email = getPayload(c)?.email;
  if (!email) return c.json({}, 404);
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

  // load chat from db (drizzle)
  let chat: any = await db.getChatById(chatId);

  const chatExists = !!chat;

  // if chat exists in DB, load its messages from messages table
  if (chatExists) {
    const dbMessages = await db.getMessagesByChatById(chatId);
    chat.messages = (dbMessages || []).map((m: any) => ({
      id: m.id,
      role: m.role,
      content: m.content,
      createdAt: m.createdAt,
    }));
  }

  const now = new Date();

  if (!chatExists) {
    chat.updatedAt = now;
    chat.messages.push(...messages);
  } else {
    // create an in-memory chat object (will be persisted elsewhere)
    chat = {
      id: chatId,
      createdAt: now,
      updatedAt: now,
      title: 'New Chat',
      model,
      // generationStatus: 'completed' as const,
      // branchParent: null,
      // pinned: false,
      //   threadId: '5e9c32dc-d336-45a9-bd02-fe2cadfe1ca7',
      // userSetTitle: false,
      messages: [...messages],
    } as any;
  }

  // console.log(convertToModelMessages(messages));//[ { role: 'user', content: [ [Object] ] } ]

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
    onFinish: async ({ messages }) => {
      // keep updatedAt as Date
      chat.messages = messages;

      const email = getPayload(c).email;

      if (!chatExists) {
        await db.transaction(async (tx) => {
          await tx.updateUser(email, { currentlySelectedModel: model });
          await tx.createChat({
            id: chat.id,
            createdAt: chat.createdAt,
            updatedAt: chat.updatedAt,
            title: chat.title,
            model: chat.model,
          });
          await tx.createMessages(
            messages.map((m) => ({ ...m, chatId: chat.id }))
          );
        });
      } else {
        await db.transaction(async (tx) => {
          await tx.updateUser(email, { currentlySelectedModel: model });
          await tx.updateChat(chat.id, {
            updatedAt: new Date(),
            model: chat.model,
          });
        });
      }
    },
  });
});
