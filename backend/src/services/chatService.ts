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
import { db } from '../db';
import { logger } from '../logger';
import { AppError } from '../exception';
import { ModelParameters, Usage } from '../types';
import { decrement, getModel } from '../helpers';
import { usersTable } from '../schemas/schema';
import { consts } from '../constants';

const generateTitle = async ({
  message,
  userId,
}: {
  message: UIMessage;
  userId: string;
}) => {
  const result = await generateText({
    model: getModel({
      model: consts.TITLE_GEN_MODEL,
      userId,
    }),
    messages: convertToModelMessages([message]),
    system: `Generate a concise, descriptive title (3-8 words) for this chat based on the user's first message. Focus on the main topic or question being asked.`,
  });

  // remove leading and trailing quotes
  let title = result.text.replace(/^["']|["']$/g, '');
  title = title.length > 50 ? title.substring(0, 47) + '...' : title;

  return title;
};

export const postChat = async (data: {
  message: UIMessage;
  model: string;
  chatId: string;
  userId?: string;
  modelParameters: ModelParameters | null;
}) => {
  const { message, model, chatId: _chatId, userId, modelParameters } = data;

  if (!userId) {
    throw new AppError('UNAUTHORIZED', data);
  }

  // cache this in reddis
  const user = await db.getUserById(userId);

  if (user.role !== 'admin' && parseFloat(user.credits) <= 0)
    throw new AppError('CREDITS_EXPIRED', { userId });

  // If chat exists, we can diff messages later by id. If not, we will create it onFinish.
  let existingChat;

  try {
    existingChat = await db.getChatById(_chatId);
  } catch (error) {
    if (!(error instanceof AppError && error.status === 404)) {
      throw error;
    }
  }

  const chatExists = !!existingChat;

  const chat = { model, userId, modelParameters };

  if (!chatExists) {
    existingChat = await db.createChat(chat);
  }

  if (!existingChat) {
    throw new AppError('INTERNAL_ERROR', { chat });
  }

  const chatId = existingChat.id;

  // You can pass just the latest user message in "messages".
  // If you want to include full history from DB, fetch and merge here.
  let allMessages: UIMessage[];

  if (chatExists) {
    const messageHistory = await db.getMessages(chatId);
    if (messageHistory) {
      allMessages = [...messageHistory, message];
    } else allMessages = [];
  } else allMessages = [message];

  db.createMessages([{ ...message, chatId, model }]);

  const stream = createUIMessageStream({
    generateId: () => crypto.randomUUID(),
    execute: async ({ writer }) => {
      // 1. Send initial status (transient - won't be added to message history)
      writer.write({
        type: 'data-id',
        data: { id: chatId },
        transient: true,
      });

      let titlePromise: Promise<string>;

      if (allMessages.length === 1) {
        titlePromise = generateTitle({
          message,
          userId,
        });
      }

      const result = streamText({
        model: getModel({ model, userId, modelParameters }),
        messages: convertToModelMessages(allMessages),
        experimental_transform: smoothStream({
          delayInMs: 20, // optional: defaults to 10ms
          chunking: 'word',
        }),
        async onFinish(event) {
          let title;

          if ((title = await titlePromise)) {
            writer.write({
              type: 'data-generate-title',
              data: { title, id: chatId },
              transient: true,
            });
          }

          const usage = event.providerMetadata?.openrouter?.usage as
            | Usage
            | undefined;

          let meta:
            | {
                inputTokens: number;
                outputTokens: number;
                totalTokens: number;
                totalCost: number;
              }
            | undefined;

          if (usage) {
            meta = {
              inputTokens: usage.promptTokens,
              outputTokens: usage.completionTokens,
              totalTokens: usage.totalTokens,
              totalCost: usage.cost,
            };
          }

          if (meta) {
            writer.write({
              type: 'data-usage',
              data: {
                id: chatId,
                ...meta,
              },
              transient: true,
            });
          }

          db.updateChat({
            id: chatId,
            title,
            ...meta,
          });

          db.createOrUpdateChatTrans(async (tx) => {
            await db.updateUser(
              {
                userId,
                currentlySelectedModel: model,
                currentModelParameters: modelParameters,
                credits: decrement(usersTable.credits, meta?.totalCost ?? 0),
              },
              tx
            );

            await db.updateChat(
              {
                id: chatId,
                ...(meta ?? {}),
              },
              tx
            );
          });
        },
      });

      writer.merge(
        result.toUIMessageStream({
          generateMessageId: () => crypto.randomUUID(),
          onFinish: ({ messages: completedMessages }) => {
            const _messages = [
              ...completedMessages.map((e) => ({
                ...e,
                chatId,
                model,
              })),
            ];
            db.createMessages(_messages);
          },
        })
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
};
