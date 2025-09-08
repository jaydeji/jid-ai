import { DefaultChatTransport, generateId } from 'ai'
import { useNavigate } from '@tanstack/react-router'
import { useChat } from '@ai-sdk/react'
import { useState } from 'react'
import type { ComponentPropsWithoutRef } from 'react'
import type { Chat, MyUIMessage } from '@/types'
import { ChatInput, ChatInputTextArea } from '@/components/ui/chat-input'
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from '@/components/ui/chat-message'
import { ChatMessageArea } from '@/components/ui/chat-message-area'
import { config, queryClient } from '@/services'
import { BottomBar } from '@/templates/BottomBar'
import { chatKey } from '@/services/react-query/keys'

export function Chat({
  className,
  data,
  ...props
}: ComponentPropsWithoutRef<'div'> & { data: any }) {
  const { messages, sendMessage, status, stop } = useChat<MyUIMessage>({
    id: data?.id,
    messages: data?.messages,
    transport: new DefaultChatTransport({
      api: config.VITE_API_URL + '/chat',
    }),
  })

  const navigate = useNavigate()

  const [text, setText] = useState<string>('')
  const [model, setModel] = useState<string>(
    'novita/meta-llama/llama-3.2-1b-instruct', // openai/gpt-5-mini:flex
  )

  // useEffect(() => {
  //   if (data?.messages) {
  //     setMessages(data.messages)
  //   }
  // }, [data?.messages])

  const handleSubmit = () => {
    const chatId = data?.id ? data.id : generateId()

    sendMessage({ text }, { body: { model, chatId } })
    setText('')

    if (!data?.id) {
      queryClient.setQueryData<Chat>(chatKey(chatId), {
        id: chatId,
        createdAt: 1757313146055,
        title: 'New Chat',
        updatedAt: 1757314442518,
        userSetTitle: false,
        messages: [
          {
            id: generateId(),
            role: 'user' as const,
            parts: [{ type: 'text' as const, text }],
          },
        ],
      })
    }

    navigate({
      to: '/chats/$chatId',
      params: { chatId },
    })
  }

  const isLoading = status === 'submitted'

  const handleSubmitMessage = () => {
    if (isLoading) {
      return
    }
    handleSubmit()
  }

  console.log(messages, data?.messages)

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
