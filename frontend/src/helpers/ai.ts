import { Chat as ReactChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { Chat, MyUIMessage } from '@/types'
import type { QueryClient } from '@tanstack/react-query'
import type { AppRouter } from '@/routes'
import { router } from '@/routes'
import { chatsKey } from '@/services/react-query/keys'
import { getAuthHeader } from '@/services/auth'
import { config, queryClient } from '@/services'

type Data = {
  type: `data-${string}`
  id?: string | undefined
  data: unknown
}

export const onData = (
  dt: Data,
  router: AppRouter,
  queryClient: QueryClient,
) => {
  const chatId = (dt.data as any)?.id

  if (dt.type === 'data-id') {
    router.navigate({
      to: '/chats/$chatId',
      params: { chatId },
    })
  }

  if (dt.type === 'data-generate-title') {
    queryClient.setQueriesData<Chat | Array<Chat>>(
      { queryKey: chatsKey },
      (data) => {
        if (data === undefined) return
        const title = (dt.data as any)?.title
        if (Array.isArray(data)) {
          return [
            {
              id: chatId,
              title,
            } as Chat,
            ...data,
          ]
        }
        return { ...data, title }
      },
    )
  }
}

export const getOptions = () => ({
  transport: new DefaultChatTransport({
    api: config.VITE_API_URL + '/chat',
    headers: ((): Record<string, string> => {
      const header = getAuthHeader()
      return header ? { Authorization: header } : {}
    })(),
    prepareSendMessagesRequest: ({ id, messages, body }) => {
      return {
        body: {
          id,
          message: messages[messages.length - 1],
          ...body,
        },
      }
    },
  }),
  onData: (dt: Data) => onData(dt, router, queryClient),
  generateId: () => crypto.randomUUID(),
})

export const createChat = () => {
  return new ReactChat<MyUIMessage>(getOptions())
}
