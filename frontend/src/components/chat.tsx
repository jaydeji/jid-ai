import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import type { MyUIMessage } from '@/types'
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from '@/components/ui/chat-input'
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from '@/components/ui/chat-message'
import { ChatMessageArea } from '@/components/ui/chat-message-area'
import { config } from '@/services'
import { BottomBar } from '@/templates/BottomBar'

export function Chat({ className, ...props }: ComponentPropsWithoutRef<'div'>) {
  const { messages, sendMessage, status, stop } = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({
      api: config.VITE_API_URL + '/chat',
    }),
  })

  const [text, setText] = useState<string>('')
  const [model, setModel] = useState<string>('openai/gpt-5-mini:flex')

  const handleSubmit = () => {
    sendMessage({ text }, { body: { model } })
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
    <div className="flex-1 flex flex-col h-full overflow-y-auto" {...props}>
      <ChatMessageArea scrollButtonAlignment="center">
        <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
          {messages.map((message) => {
            if (message.role !== 'user') {
              return (
                <ChatMessage key={message.id} id={message.id}>
                  <ChatMessageAvatar />
                  {message.parts.map((part, index) =>
                    part.type === 'text' ? (
                      <ChatMessageContent key={index} content={part.text} />
                    ) : null,
                  )}
                </ChatMessage>
              )
            }
            return (
              <ChatMessage
                key={message.id}
                id={message.id}
                variant="bubble"
                type="outgoing"
              >
                {message.parts.map((part, index) =>
                  part.type === 'text' ? (
                    <ChatMessageContent key={index} content={part.text} />
                  ) : null,
                )}
              </ChatMessage>
            )
          })}
        </div>
      </ChatMessageArea>
      <div className="px-2 py-4 max-w-2xl mx-auto w-full">
        <ChatInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          onSubmit={handleSubmitMessage}
          loading={isLoading}
          onStop={stop}
        >
          <ChatInputTextArea placeholder="Type a message..." />
          <BottomBar model={model} setModel={setModel} />
        </ChatInput>
      </div>
    </div>
  )
}
