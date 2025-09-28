import { Chat as ReactChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import { toast } from 'sonner'
import { v4 as uuidv4 } from 'uuid'
import type { Chat, MyUIMessage, Usage } from '@/types'
import { router } from '@/routes'
import { chatKey, chatsKey } from '@/services/react-query/keys'
import { getAuthHeader } from '@/services/auth'
import { config, queryClient } from '@/services'

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
              updatedAt: Date.now(),
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
  generateId: () => uuidv4(),
})

export const createChat = () => {
  return new ReactChat<MyUIMessage>(getOptions())
}

export const reconcileMessages = ({
  prevMessages,
  serverMessages,
}: {
  prevMessages: Array<MyUIMessage>
  serverMessages?: Array<MyUIMessage>
  chatId?: string
}) => {
  const newMessages = serverMessages || []

  const result: Array<any> = prevMessages.length ? prevMessages : newMessages

  return result
}
