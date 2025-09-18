import type { UseChatHelpers } from '@ai-sdk/react'
import type { ComponentPropsWithoutRef } from 'react'
import type { MyUIMessage } from '@/types'
import { ChatInput, ChatInputTextArea } from '@/components/ui/chat-input'
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from '@/components/ui/chat-message'
import { ChatMessageArea } from '@/components/ui/chat-message-area'
import { BottomBar } from '@/templates/BottomBar'

export function MyChat({
  className,
  chatOptions,
  text,
  setText,
  setModel,
  model,
  isLoading,
  handleSubmitMessage,
  ...props
}: ComponentPropsWithoutRef<'div'> & {
  chatOptions: UseChatHelpers<MyUIMessage>
  text: string
  setText: (e: string) => void
  handleSubmitMessage: any
  isLoading: any
  model: any
  setModel: any
}) {
  return (
    <>
      <ChatMessageArea scrollButtonAlignment="center">
        <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
          {chatOptions.messages.map((message) => {
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
                {message.parts.map((part, index) => {
                  switch (part.type) {
                    case 'text':
                      return (
                        <ChatMessageContent key={index} content={part.text} />
                      )
                    default:
                      return null
                  }
                })}
              </ChatMessage>
            )
          })}

          {chatOptions.error && (
            <div className="text-red-400">An error occured</div>
          )}
        </div>
      </ChatMessageArea>
      <div className="px-2 py-4 max-w-2xl mx-auto w-full">
        <ChatInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          onSubmit={handleSubmitMessage}
          loading={isLoading}
          onStop={chatOptions.stop}
        >
          <ChatInputTextArea placeholder="Type a message..." />
          <BottomBar model={model} setModel={setModel} />
        </ChatInput>
      </div>
    </>
  )
}
