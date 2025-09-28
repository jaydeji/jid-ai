import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useChat } from '@ai-sdk/react'
import { MyChatMessage } from './chat-message'
import { ChatInput, ChatInputTextArea } from '@/components/ui/chat-input'
import { ChatMessageArea } from '@/components/ui/chat-message-area'
import { UsageStats } from '@/components/ui/usage-stats'
import { BottomBar } from '@/templates/BottomBar'
import { useStore } from '@/store'
import { reconcileMessages } from '@/helpers/ai'
import { useChatQuery } from '@/services/react-query/hooks'

function useChatMessages(chatId: string | undefined) {
  const chat = useStore((state) => state.chat)
  const { setMessages, messages } = useChat({ chat })

  const { data } = useChatQuery()

  const oldChatId = useRef(chatId)

  const msgs = useMemo(() => {
    return reconcileMessages({
      prevMessages: messages,
      serverMessages: data?.messages,
    })
  }, [data])

  useEffect(() => {
    if (chatId && data) {
      setMessages(msgs)
    }
  }, [data, chatId])

  useEffect(() => {
    const previousChatId = oldChatId.current

    // Only clear messages when switching between different non-null chatIds
    if (previousChatId && chatId && previousChatId !== chatId) {
      setMessages([])
    }

    // clear messages when we move from  chat Id to no chatId i.e new chat
    if (previousChatId && !chatId) {
      setMessages([])
    }

    // Update ref for next comparison
    oldChatId.current = chatId
  }, [chatId])
}

export function ChatPage() {
  const [text, setText] = useState<string>('')

  const modelParameters = useStore((state) => state.modelParameters)
  const model = useStore((state) => state.model)

  const { chatId } = useParams({ strict: false })

  const chat = useStore((state) => state.chat)
  const { sendMessage } = useChat({ chat })

  const handleSubmit = () => {
    sendMessage(
      { text },
      { body: { model, chatId, modelParameters, createdAt: new Date() } },
    )
    setText('')
  }

  const isLoading = status === 'submitted'

  const handleSubmitMessage = () => {
    if (isLoading) {
      return
    }
    handleSubmit()
  }

  useChatMessages(chatId)

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-background overflow-hidden">
      <ChatMessageArea scrollButtonAlignment="center">
        <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
          <MyChatMessage />
        </div>
      </ChatMessageArea>
      <div className="px-2 py-4 max-w-2xl mx-auto w-full shrink-0">
        <ChatInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          onSubmit={handleSubmitMessage}
          loading={isLoading}
          onStop={stop}
        >
          <UsageStats />
          <ChatInputTextArea placeholder="Type a message..." />
          <BottomBar />
        </ChatInput>
      </div>
    </div>
  )
}

// ChatPage.whyDidYouRender = true
