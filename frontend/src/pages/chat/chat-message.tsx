import { MessageSquare } from 'lucide-react'
import { useChat } from '@ai-sdk/react'
import { ConversationEmptyState } from '@/components/ai-elements/conversation'
import {
  ChatMessage,
  ChatMessageAvatar,
  ChatMessageContent,
} from '@/components/ui/chat-message'
import { extractTextFromParts } from '@/helpers/other'
import { Copy } from '@/components/Copy'
import { Actions } from '@/components/ai-elements/actions'
import { useStore } from '@/store'
import { useChatQuery } from '@/services/react-query/hooks'

export const MyChatMessage = () => {
  const chat = useStore((state) => state.chat)
  const { messages, error } = useChat({ chat })
  const { isPending } = useChatQuery()

  return (
    <>
      {messages.length === 0 && !isPending ? (
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
            <ChatMessage key={message.id} id={message.id} {...chatMessageProps}>
              {!isUserMessage && <ChatMessageAvatar />}
              {message.parts.map((part, index) => {
                switch (part.type) {
                  // no reasoning or tool calls here
                  case 'text':
                    return (
                      <div key={index}>
                        <ChatMessageContent content={part.text} />
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
    </>
  )
}

// MyChatMessage.whyDidYouRender = true
