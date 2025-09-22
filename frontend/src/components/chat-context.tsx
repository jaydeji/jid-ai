import { createContext, useContext, useState } from 'react'
import type { Chat as ReactChat } from '@ai-sdk/react'
import type { ReactNode } from 'react'
import type { MyUIMessage } from '@/types'
import { createChat } from '@/helpers/ai'

interface ChatContextValue {
  // replace with your custom message type
  chat: ReactChat<MyUIMessage>
  clearChat: (initMessage: any) => void
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

export function ChatProvider({ children }: { children: ReactNode }) {
  const [chat, setChat] = useState(() => createChat([]))

  const clearChat = (initMessage: any) => {
    setChat(createChat(initMessage))
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
