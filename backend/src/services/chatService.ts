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
import { config } from '../config';
import { logger } from '../logger';
import { AppError } from '../exception';
import { OpenAICallData } from '../types';
import { decrement, getModel } from '../helpers';
import { usersTable } from '../schema';
import { consts } from '../constants';

export const postChat = async (data: {
  message: UIMessage;
  model: string;
  chatId: string;
  userId?: string;
}) => {
  const { message, model, chatId: _chatId, userId } = data;

  if (!userId) {
    logger.error(data);
    throw new AppError('UNAUTHORIZED');
  }

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

  const chat = { model, userId };

  if (!chatExists) {
    existingChat = await db.createChat(chat);
  }

  if (!existingChat) {
    logger.error(chat);
    throw new AppError('INTERNAL_ERROR');
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

  const stream = createUIMessageStream({
    generateId: () => crypto.randomUUID(),
    execute: async ({ writer }) => {
      // 1. Send initial status (transient - won't be added to message history)
      writer.write({
        type: 'data-id',
        data: { id: chatId },
        transient: true,
      });

      if (allMessages.length === 1) {
        generateText({
          model: getModel({
            model: consts.TITLE_GEN_MODEL,
            userId,
          }),
          messages: convertToModelMessages([message]),
          system: `Generate a concise, descriptive title (3-8 words) for this chat based on the user's first message. Focus on the main topic or question being asked.`,
        }).then((data) => {
          // logger.debug(data.response.id);
          // logger.debug(data.providerMetadata?.openrouter?.usage);
          // remove leading and trailing quotes
          let title = data.text.replace(/^["']|["']$/g, '');
          title = title.length > 50 ? title.substring(0, 47) + '...' : title;

          writer.write({
            type: 'data-generate-title',
            data: { title, id: chatId },
            transient: true,
          });

          db.updateChat({
            id: chatId,
            title,
          });
        });
      }

      const result = streamText({
        model: getModel({ model, userId }),
        messages: convertToModelMessages(allMessages),
        providerOptions: {
          openai: {
            reasoningEffort: 'high',
          },
        },
        experimental_transform: smoothStream({
          delayInMs: 20, // optional: defaults to 10ms
          chunking: 'word',
        }),
        onFinish: async ({ usage, providerMetadata, response }) => {
          // logger.debug({ providerMetadata });
          // logger.debug(response.messages);
        },
      });

      // getStats((await result.response).id).then((e) => logger.debug(e));
      // logger.debug(result.providerMetadata)

      writer.merge(
        result.toUIMessageStream({
          sendReasoning: true,
          generateMessageId: () => crypto.randomUUID(),
          // originalMessages: allMessages,
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
          onFinish: async ({ messages: completedMessages }) => {
            db.createOrUpdateChatTrans(async (tx) => {
              await db.updateUser(
                {
                  userId,
                  currentlySelectedModel: model,
                  credits: decrement(usersTable.credits, 10),
                },
                tx
              );
              const _messages = [
                { ...message, chatId, model },
                ...completedMessages.map((e) => ({
                  ...e,
                  chatId,
                  model,
                })),
              ];

              await db.createMessages(_messages, tx);

              const usage = (await result.providerMetadata)?.openrouter
                ?.usage as {
                promptTokens?: string;
                completionTokens?: string;
                totalTokens?: string;
                cost?: string;
              };

              await db.updateChat(
                {
                  id: chatId,
                  inputTokens: usage?.promptTokens,
                  outputTokens: usage.completionTokens,
                  totalTokens: usage?.totalTokens,
                  totalCost: usage?.cost,
                },
                tx
              );
            });
          },
        })
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
};

export const getStats = async (id: string) => {
  try {
    const generation = await fetch(
      `${config.OPEN_ROUTER_BASE_URL}/generation?id=${id}`,
      { headers: { Authorization: `Bearer ${config.OPEN_ROUTER_API_KEY}` } }
    );

    const stats: OpenAICallData = await generation.json();

    return stats;
  } catch (error) {
    logger.error(error);
    return {};
  }
};
