import { useState } from 'react'
import { ChatInput, ChatInputTextArea } from '@/components/ui/chat-input'
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from '@/components/ui/chat-message'
import { ChatMessageArea } from '@/components/ui/chat-message-area'
import { BottomBar } from '@/templates/BottomBar'
import { useMyChat } from '@/services/react-query/hooks'
import { useStore } from '@/store'

export function ChatPage() {
  const [text, setText] = useState<string>('')
  const { model, setModel } = useStore()

  const { messages, error, stop, sendMessage, status, chatId, data } =
    useMyChat()

  const handleSubmit = () => {
    sendMessage({ text }, { body: { model, chatId } })
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
    <>
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

          {error && <div className="text-red-400">An error occured</div>}
        </div>
      </ChatMessageArea>
      {!!data?.totalCost && (
        <div>
          <span>
            Cost: {Number(data.totalCost)} Tokens: {data.totalTokens}
          </span>
        </div>
      )}
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
    </>
  )
}
