import type { MyUIMessage } from '@/types'
import {
  Conversation,
  ConversationContent,
  ConversationScrollButton,
} from '@/components/ui/shadcn-io/ai/conversation'
import {
  Message,
  MessageAvatar,
  MessageContent,
} from '@/components/ui/shadcn-io/ai/message'

const MyConversation = ({ messages }: { messages: Array<MyUIMessage> }) => {
  return (
    <Conversation className="relative size-full" style={{ height: '498px' }}>
      <ConversationContent>
        {messages.map((message) => (
          <Message
            from={message.role === 'user' ? 'user' : 'assistant'}
            key={message.id}
          >
            {message.parts.map((part, index) =>
              part.type === 'text' ? (
                <MessageContent key={index}>{part.text}</MessageContent>
              ) : null,
            )}

            {/* <MessageAvatar name={name} src={avatar} /> */}
          </Message>
        ))}
      </ConversationContent>
      <ConversationScrollButton />
    </Conversation>
  )
}
export { MyConversation }
