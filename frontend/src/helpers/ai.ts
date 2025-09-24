import { Chat as ReactChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { toast } from 'sonner'
import type { ChatOnFinishCallback } from 'ai'
import type { Chat, MyUIMessage, Usage } from '@/types'
import type { QueryClient } from '@tanstack/react-query'
import type { AppRouter } from '@/routes'
import { router } from '@/routes'
import { chatKey, chatsKey } from '@/services/react-query/keys'
import { getAuthHeader } from '@/services/auth'
import { MyFetch, config, queryClient } from '@/services'

type Event = {
  type: `data-${string}`
  id?: string | undefined
  data: unknown
}

export const onData = (event: Event) => {
  const chatId = (event.data as any)?.id

  if (event.type === 'data-id') {
    router.navigate({
      to: '/chats/$chatId',
      params: { chatId },
    })
  }

  if (event.type === 'data-generate-title') {
    queryClient.setQueriesData<Chat | Array<Chat>>(
      { queryKey: chatsKey },
      (old) => {
        if (old === undefined) return
        const title = (event.data as any)?.title
        if (Array.isArray(old)) {
          return [
            {
              id: chatId,
              title,
            } as Chat,
            ...old,
          ]
        }
        return old
      },
    )
  }

  if (event.type === 'data-usage') {
    const usage = event.data as Usage | undefined

    queryClient.setQueryData<Chat>(chatKey(chatId), (old) => {
      if (!old) return old

      const newData: Chat = {
        ...old,
        ...usage,
      }

      return newData
    })
  }
}

export const onFinish = (event: any) => {
  // const messages: Array<any> | undefined = event.messages
  // const chatId = messages?.[0]?.chatId
  // if (messages?.length && chatId) {
  //   queryClient.setQueriesData<Chat | Array<Chat>>(
  //     { queryKey: chatKey(chatId) },
  //     (old) => {
  //       if (!Array.isArray(old)) {
  //         const newData = { ...old, messages: messages } as Chat
  //         return newData
  //       }
  //       return old
  //     },
  //   )
  // }
}

export const getOptions = (): ConstructorParameters<
  typeof ReactChat<MyUIMessage>
>[0] => ({
  transport: new DefaultChatTransport({
    api: config.VITE_API_URL + '/chat',
    headers: (): Record<string, string> => {
      const header = getAuthHeader()
      return header ? { Authorization: header } : {}
    },
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
  onData: (event: Event) => onData(event),
  onFinish: (event: any) => onFinish(event),
  onError: (event) => {
    if (event.message) {
      toast.error(JSON.parse(event.message)?.message)
    }
  },
  generateId: () => crypto.randomUUID(),
})

export const createChat = () => {
  return new ReactChat<MyUIMessage>(getOptions())
}

export const reconcileMessages = ({
  chatId,
  prevMessages,
  serverMessages,
}: {
  prevMessages: Array<MyUIMessage>
  serverMessages?: Array<MyUIMessage & { createdAt: Date }>
  chatId?: string
}) => {
  const newMessages = serverMessages || []

  if (!prevMessages.length) return newMessages

  if (prevMessages[0].chatId !== chatId) return newMessages

  // Get IDs of existing messages
  const existingIds = new Set(prevMessages.map((msg) => msg.id))

  // Filter server messages to only new ones
  const newMessagesToAppend = newMessages.filter(
    (msg) => !existingIds.has(msg.id),
  )

  // Append new messages to existing ones
  const result = [...prevMessages, ...newMessagesToAppend]

  return result
}
