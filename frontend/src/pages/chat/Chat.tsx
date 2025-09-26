import { useState } from 'react'
import { MyChatMessage } from './chat-message'
import { ChatInput, ChatInputTextArea } from '@/components/ui/chat-input'
import { ChatMessageArea } from '@/components/ui/chat-message-area'
import { UsageStats } from '@/components/ui/usage-stats'
import { BottomBar } from '@/templates/BottomBar'
import { useMyChat } from '@/services/react-query/hooks'
import { useStore } from '@/store'

export function ChatPage() {
  const [text, setText] = useState<string>('')

  const modelParameters = useStore((state) => state.modelParameters)
  const model = useStore((state) => state.model)

  const { sendMessage, chatId } = useMyChat()

  const handleSubmit = () => {
    sendMessage({ text }, { body: { model, chatId, modelParameters } })
    setText('')
  }

  const isLoading = status === 'submitted'

  const handleSubmitMessage = () => {
    if (isLoading) {
      return
    }
    handleSubmit()
  }

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
