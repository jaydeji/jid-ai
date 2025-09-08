export const userKey = ['user']
export const modelKey = ['models']
export const chatsKey = ['chats']
export const chatKey = (chatId: string) => [chatsKey, chatId] as const
