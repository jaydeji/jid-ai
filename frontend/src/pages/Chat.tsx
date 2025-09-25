import { useState } from 'react'
import { CopyIcon, MessageSquare, RefreshCcwIcon } from 'lucide-react'
import { ChatInput, ChatInputTextArea } from '@/components/ui/chat-input'
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from '@/components/ui/chat-message'
import { ChatMessageArea } from '@/components/ui/chat-message-area'
import { UsageStats } from '@/components/ui/usage-stats'
import { BottomBar } from '@/templates/BottomBar'
import { useMyChat } from '@/services/react-query/hooks'
import { useStore } from '@/store'
import { ConversationEmptyState } from '@/components/ai-elements/conversation'
import { Action, Actions } from '@/components/ai-elements/actions'
import { Copy } from '@/components/Copy'
import { extractTextFromParts } from '@/helpers/other'

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
    <div className="flex-1 flex flex-col h-full min-h-0 bg-background overflow-hidden">
      <ChatMessageArea scrollButtonAlignment="center">
        <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
          {messages.length === 0 ? (
            <ConversationEmptyState
              icon={<MessageSquare className="size-12" />}
              title="Start a conversation"
              description="Type a message below to begin chatting"
            />
          ) : (
            messages.map((message) => {
              const isUserMessage = message.role === 'user'

              const chatMessageProps: any = {
                ...(isUserMessage && {
                  variant: 'bubble',
                  type: 'outgoing',
                }),
              }

              return (
                <ChatMessage
                  key={message.id}
                  id={message.id}
                  {...chatMessageProps}
                >
                  {!isUserMessage && <ChatMessageAvatar />}
                  {message.parts.map((part, index) => {
                    switch (part.type) {
                      // no reasoning or tool calls here
                      case 'text':
                        return (
                          <div>
                            <ChatMessageContent
                              key={index}
                              content={part.text}
                            />
                            <div>
                              {!isUserMessage && (
                                <Actions className="mt-1.5 gap-2">
                                  {/* <RefreshCcwIcon size={12} /> */}
                                  <Copy
                                    text={extractTextFromParts(message.parts)}
                                    title="copy"
                                  />
                                </Actions>
                              )}
                            </div>
                          </div>
                        )
                      default:
                        return null
                    }
                  })}
                </ChatMessage>
              )
            })
          )}
          {error && <div className="text-red-400">An error occured</div>}
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
          <UsageStats data={data} />
          <ChatInputTextArea placeholder="Type a message..." />
          <BottomBar model={model} setModel={setModel} />
        </ChatInput>
      </div>
    </div>
  )
}
