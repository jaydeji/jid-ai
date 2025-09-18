export const userKey = ['user']
export const modelKey = ['models']
// ALERT: adding new chat could fail because of the queryclient setquerydata
export const chatsKey = ['chats']
export const chatKey = (chatId: string) => [...chatsKey, chatId] as const
