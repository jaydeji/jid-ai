import 'dotenv-defaults/config';
import {
  convertToModelMessages,
  createUIMessageStream,
  createUIMessageStreamResponse,
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
  const chat = await db.getChatAndMessagesById(id);
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
    message,
    model,
    chatId: _chatId,
  }: { message: UIMessage; model: string; chatId: string } = await c.req.json();

  const userId = getPayload(c).sub;
  if (!userId) return c.json({ error: 'Unauthorized' }, 401);

  // If chat exists, we can diff messages later by id. If not, we will create it onFinish.
  let existingChat = await db.getChatById(_chatId);

  const chatExists = !!existingChat;

  if (!chatExists) {
    existingChat = await db.createChat({ model });
  }

  if (!existingChat) {
    return c.json({ error: 'Internal Server Error' }, 500);
  }

  const chatId = existingChat.id;

  // You can pass just the latest user message in "messages".
  // If you want to include full history from DB, fetch and merge here.
  let allMessages: UIMessage[];

  if (chatExists) {
    const messageHistory = await db.getMessagesByChatById(chatId);
    if (messageHistory) {
      allMessages = [...messageHistory, message];
    } else allMessages = [];
  } else allMessages = [message];

  const stream = createUIMessageStream({
    generateId: () => crypto.randomUUID(),
    execute: ({ writer }) => {
      // 1. Send initial status (transient - won't be added to message history)
      writer.write({
        type: 'data-id',
        data: { id: chatId },
        transient: true, // This part won't be added to message history
      });

      const result = streamText({
        model: openrouter(model),
        messages: convertToModelMessages(allMessages),

        // providerOptions: {
        //   openai: {
        //     reasoningEffort: 'high',
        //   },
        // },
        // experimental_transform: smoothStream({
        //   delayInMs: 20, // optional: defaults to 10ms
        //   chunking: 'line', // optional: defaults to 'word'
        // }),
      });

      writer.merge(
        result.toUIMessageStream({
          messageMetadata: ({ part }) => {
            if (part.type === 'finish') {
              return {
                totalTokens: part.totalUsage.totalTokens,
                promptTokens: part.totalUsage.inputTokens,
                completionTokens: part.totalUsage.outputTokens,
                finishReason: part.finishReason,
              };
            }
          },
        })
      );
    },
    // originalMessages: allMessages,
    onFinish: async ({ messages: completedMessages }) => {
      const now = new Date();

      db.createOrUpdateChatTrans(async (tx) => {
        // update user
        await db.updateUser(userId, { currentlySelectedModel: model }, tx);

        await db.updateChat(
          {
            id: chatId,
            updatedAt: now,
            model,
          },
          tx
        );

        // create messages
        await db.createMessages(
          [
            { ...message, chatId, model },
            ...completedMessages.map((e) => ({
              ...e,
              chatId,
              model,
            })),
          ],
          tx
        );
      });
    },
  });

  return createUIMessageStreamResponse({ stream });
});
