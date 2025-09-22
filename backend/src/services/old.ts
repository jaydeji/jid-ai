// const stream = createUIMessageStream({
//   generateId: () => crypto.randomUUID(),
//   execute: async ({ writer }) => {
//     // 1. Send initial status (transient - won't be added to message history)
//     writer.write({
//       type: 'data-id',
//       data: { id: chatId },
//       transient: true,
//     });

//     if (allMessages.length === 1) {
//       generateText({
//         model: getModel({
//           model: consts.TITLE_GEN_MODEL,
//           userId,
//         }),
//         messages: convertToModelMessages([message]),
//         system: `Generate a concise, descriptive title (3-8 words) for this chat based on the user's first message. Focus on the main topic or question being asked.`,
//       }).then((data) => {
//         // logger.debug(data.response.id);
//         // logger.debug(data.providerMetadata?.openrouter?.usage);
//         // remove leading and trailing quotes
//         let title = data.text.replace(/^["']|["']$/g, '');
//         title = title.length > 50 ? title.substring(0, 47) + '...' : title;

//         writer.write({
//           type: 'data-generate-title',
//           data: { title, id: chatId },
//           transient: true,
//         });

//         db.updateChat({
//           id: chatId,
//           title,
//         });
//       });
//     }

//     const result = streamText({
//       model: getModel({ model, userId }),
//       messages: convertToModelMessages(allMessages),
//       providerOptions: {
//         openai: {
//           reasoningEffort: 'high',
//         },
//       },
//       experimental_transform: smoothStream({
//         delayInMs: 20, // optional: defaults to 10ms
//         chunking: 'word',
//       }),
//       onFinish: async ({ usage, providerMetadata }) => {
//         // Optional: Log or handle raw finish if needed
//       },
//     });

//     // getStats((await result.response).id).then((e) => logger.debug(e));
//     // logger.debug(result.providerMetadata)

//     writer.merge(
//       result.toUIMessageStream({
//         sendReasoning: true,
//         generateMessageId: () => crypto.randomUUID(),
//         // originalMessages: allMessages,
//         messageMetadata: ({ part }) => {
//           if (part.type === 'finish') {
//             return {
//               totalTokens: part.totalUsage.totalTokens,
//               promptTokens: part.totalUsage.inputTokens,
//               completionTokens: part.totalUsage.outputTokens,
//               finishReason: part.finishReason,
//             };
//           }
//         },
//         onFinish: ({ messages: completedMessages }) => {
//           setTimeout(async () => {
//             // Use metadata from the assistant message for usage (no await needed)
//             const assistantMessage = completedMessages[0];
//             const metadata = assistantMessage as any; // To access metadata added by messageMetadata
//             const usage = {
//               promptTokens: metadata.promptTokens,
//               completionTokens: metadata.completionTokens,
//               totalTokens: metadata.totalTokens,
//             };

//             // Fetch cost from OpenRouter
//             const response = await result.response;
//             const responseId = response.id;
//             const stats = await getStats(responseId);
//             const cost = (stats as any).cost as string | undefined;

//             db.createOrUpdateChatTrans(async (tx) => {
//               await db.updateUser(
//                 {
//                   userId,
//                   currentlySelectedModel: model,
//                   credits: decrement(usersTable.credits, 10),
//                 },
//                 tx
//               );
//               const _messages = [
//                 { ...message, chatId, model },
//                 ...completedMessages.map((e) => ({
//                   ...e,
//                   chatId,
//                   model,
//                 })),
//               ];

//               await db.createMessages(_messages, tx);

//               await db.updateChat(
//                 {
//                   id: chatId,
//                   inputTokens: usage.promptTokens?.toString(),
//                   outputTokens: usage.completionTokens?.toString(),
//                   totalTokens: usage.totalTokens?.toString(),
//                   totalCost: cost,
//                 },
//                 tx
//               );
//             });
//           }, 0);
//         },
//       })
//     );
//   },
// });

// return createUIMessageStreamResponse({ stream });
