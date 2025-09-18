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
import { openrouter } from '../constants';

export const postChat = async ({
  message,
  model,
  chatId: _chatId,
  userId,
}: {
  message: UIMessage;
  model: string;
  chatId: string;
  userId?: string;
}) => {
  if (!userId) throw { error: 'Unauthorized', status: 401 };

  // If chat exists, we can diff messages later by id. If not, we will create it onFinish.
  let existingChat = await db.getChatById(_chatId);

  const chatExists = !!existingChat;

  if (!chatExists) {
    existingChat = await db.createChat({ model, userId });
  }

  if (!existingChat) {
    throw { error: 'Internal Server Error', status: 500 };
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

      const title = generateText({
        model: openrouter('openai/gpt-oss-20b:free'),
        messages: convertToModelMessages([message]),
        system: `Generate a concise, descriptive title (3-8 words) for this chat based on the user's first message. Focus on the main topic or question being asked.`,
      }).then((data) => {
        // remove leading and trailing quotes
        let title = data.text.replace(/^["']|["']$/g, '');
        title = title.length > 50 ? title.substring(0, 47) + '...' : title;

        return title;

        writer.write({
          type: 'data-generate-title',
          data: { title },
          transient: true,
        });

        // db.updateChat({
        //   id: chatId,
        //   title,
        // });
      });

      const result = streamText({
        model: openrouter(model),
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
      });

      writer.merge(
        result.toUIMessageStream({
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
            const now = new Date();
            writer.write({
              type: 'data-generate-title',
              data: { title },
              transient: true,
            });

            db.createOrUpdateChatTrans(async (tx) => {
              // update user
              await db.updateUser(
                userId,
                { currentlySelectedModel: model },
                tx
              );

              await db.updateChat(
                {
                  id: chatId,
                  updatedAt: now,
                  model,
                  title: await title,
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
        })
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
};
