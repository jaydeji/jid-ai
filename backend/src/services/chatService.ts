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
import { config } from '../config';

export type OpenAICallData = {
  id: string;
  total_cost: number;
  created_at: string;
  model: string;
  origin: string;
  usage: number; // This might be total_tokens, or a derived usage metric
  is_byok: boolean;
  upstream_id: string;
  cache_discount: number;
  upstream_inference_cost: number;
  app_id: number;
  streamed: boolean;
  cancelled: boolean;
  provider_name: string;
  latency: number; // In milliseconds or seconds, depending on the source
  moderation_latency: number; // In milliseconds or seconds
  generation_time: number; // In milliseconds or seconds
  finish_reason: string; // e.g., "stop", "length", "content_filter"
  native_finish_reason: string;
  tokens_prompt: number;
  tokens_completion: number;
  native_tokens_prompt: number;
  native_tokens_completion: number;
  native_tokens_reasoning: number;
  num_media_prompt: number; // e.g., for vision models
  num_media_completion: number;
  num_search_results: number;
};

export type OpenAICallResponse = {
  data: OpenAICallData;
};

export const postChat = async (data: {
  message: UIMessage;
  model: string;
  chatId: string;
  userId?: string;
}) => {
  const { message, model, chatId: _chatId, userId } = data;
  if (!userId) {
    console.error('Unauthorized', data);
    throw { error: 'Unauthorized', status: 401 };
  }

  // If chat exists, we can diff messages later by id. If not, we will create it onFinish.
  let existingChat = await db.getChatById(_chatId);

  const chatExists = !!existingChat;

  const chat = { model, userId };

  if (!chatExists) {
    existingChat = await db.createChat(chat);
  }

  if (!existingChat) {
    console.error('Internal Server Error', chat);
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
        model: openrouter('meta-llama/llama-3.2-1b-instruct'),
        messages: convertToModelMessages([message]),
        system: `Generate a concise, descriptive title (3-8 words) for this chat based on the user's first message. Focus on the main topic or question being asked.`,
      }).then((data) => {
        // remove leading and trailing quotes
        let title = data.text.replace(/^["']|["']$/g, '');
        title = title.length > 50 ? title.substring(0, 47) + '...' : title;

        return title;
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

      writer.write({
        type: 'data-generate-title',
        data: { title: await title, id: chatId },
        transient: true,
      });

      writer.merge(
        result.toUIMessageStream({
          generateMessageId: () => crypto.randomUUID(),
          // originalMessages: allMessages,
          messageMetadata: ({ part }) => {
            console.log(part);
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

              const _messages = [
                { ...message, chatId, model },
                ...completedMessages.map((e) => ({
                  ...e,
                  chatId,
                  model,
                })),
              ];

              await db.createMessages(_messages, tx);
            });
          },
        })
      );
    },
  });

  return createUIMessageStreamResponse({ stream });
};

export const getStats = async (id: string) => {
  const generation = await fetch(
    `${config.OPEN_ROUTER_BASE_URL}/generation?id=${id}`,
    { headers: { Authorization: `Bearer ${config.OPEN_ROUTER_API_KEY}` } }
  );

  const stats: OpenAICallData = await generation.json();

  console.log(stats);
};
