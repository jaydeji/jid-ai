'use client'

import { createContext, useContext, useState } from 'react'
import { Chat as ReactChat } from '@ai-sdk/react'
import { DefaultChatTransport } from 'ai'
import type { ReactNode } from 'react'
import type { Chat, MyUIMessage } from '@/types'
import { config, queryClient } from '@/services'
import { getAuthHeader } from '@/services/auth'
import { chatsKey } from '@/services/react-query/keys'
import { router } from '@/routes'

interface ChatContextValue {
  // replace with your custom message type
  chat: ReactChat<MyUIMessage>
  clearChat: () => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

function createChat() {
  return new ReactChat<MyUIMessage>({
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
    onData: (dt) => {
      if (dt.type === 'data-id') {
        router.navigate({
          to: '/chats/$chatId',
          params: { chatId: (dt.data as any).id },
        })
      }
      if (dt.type === 'data-generate-title') {
        queryClient.setQueriesData<Chat | Array<Chat>>(
          { queryKey: chatsKey },
          (data) => {
            if (data === undefined) return
            if (Array.isArray(data)) {
              return [
                {
                  id: (dt.data as any)?.id,
                  title: "I'm glad you're looking for a conversation to g...",
                } as Chat,
                ...data,
              ]
            }
            return { ...data, title: (dt.data as any)?.title }
          },
        )
      }
    },
    generateId: () => crypto.randomUUID(),
  })
}

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chat, setChat] = useState(() => createChat())

  const clearChat = () => {
    setChat(createChat())
  }

  return (
    <ChatContext.Provider
      value={{
        chat,
        clearChat,
      }}
    >
      {children}
    </ChatContext.Provider>
  )
}

export function useSharedChatContext() {
  const context = useContext(ChatContext)
  if (!context) {
    throw new Error('useSharedChatContext must be used within a ChatProvider')
  }
  return context
}
