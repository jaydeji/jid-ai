import { sign } from 'hono/jwt';
import { config } from './config';
import type { Context } from 'hono';
import { usersTable } from './schema';
import { generateText } from 'ai';
import { openrouter } from './constants';

export const generateToken = async (user: any) => {
  const payload = {
    sub: user.userId,
    role: 'user',
    exp: Math.floor(Date.now() / 1000) + 60 * 60 * 3, // Token expires in 3 hrs
  };

  const token = await sign(payload, config.AUTH_TOKEN);

  return token;
};

export const getPayload = (c: Context) => {
  try {
    const jwtPayload = c.get('jwtPayload') as any;
    return jwtPayload;
  } catch (error) {
    console.log(error);
  }
};

// export async function generateTitle(props: GenerateTitleProps) {
//   const { chatId, firstMessage, writer } = props;

//   let title = 'New Chat';

//   // writer.write({
//   //   type: 'data-generate-title',
//   //   data: { text: title },
//   //   transient: true,
//   // });
//   // await dbWrite
//   //   .update(chatTable)
//   //   .set({ name: title })
//   // .where(eq(chatTable.id, chatId));

//   const stream = createUIMessageStream({
//     generateId: () => crypto.randomUUID(),
//     execute: ({ writer }) => {
//       try {
//         const { text } = await generateText({
//           model: openrouter('openai/gpt-oss-120b:free'),
//           messages: [firstMessage],
//           system: `Generate a concise, descriptive title (3-8 words) for this chat based on the user's first message. Focus on the main topic or question being asked.`,
//         });

//         // remove leading and trailing quotes
//         title = text.replace(/^["']|["']$/g, '');
//         title = title.length > 50 ? title.substring(0, 47) + '...' : title;
//       } catch (error) {
//         console.error('Failed to generate title:', error);
//       }

//       writer.merge(
//         result.toUIMessageStream({
//           messageMetadata: ({ part }) => {
//             if (part.type === 'finish') {
//               return {
//                 totalTokens: part.totalUsage.totalTokens,
//                 promptTokens: part.totalUsage.inputTokens,
//                 completionTokens: part.totalUsage.outputTokens,
//                 finishReason: part.finishReason,
//               };
//             }
//           },
//         })
//       );
//     },
//     onFinish: async ({ messages: completedMessages }) => {},
//   });

//   return createUIMessageStreamResponse({ stream });
// }
