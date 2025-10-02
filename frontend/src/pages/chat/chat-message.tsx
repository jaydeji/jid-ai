import { FileIcon, FileTextIcon, MessageSquare } from 'lucide-react'
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

const parseTextWithAttachments = (text: string) => {
  // Match pattern: \n\n[filename.txt]\ncontent
  const attachmentPattern = /\n\n\[([^\]]+)\]\n([\s\S]*?)(?=\n\n\[|$)/g
  const attachments: Array<{ filename: string; content: string }> = []
  let match
  let lastIndex = 0
  let mainText = ''

  while ((match = attachmentPattern.exec(text)) !== null) {
    // Add text before this match
    if (match.index > lastIndex) {
      mainText += text.slice(lastIndex, match.index)
    }

    attachments.push({
      filename: match[1],
      content: match[2],
    })

    lastIndex = match.index + match[0].length
  }

  // Add remaining text after last match
  if (lastIndex < text.length) {
    mainText += text.slice(lastIndex)
  }

  // If no attachments found, return original text
  if (attachments.length === 0) {
    return { text, attachments: [] }
  }

  return { text: mainText.trim(), attachments }
}

const getFileIcon = (mediaType: any) => {
  if (mediaType.includes('pdf') || mediaType.includes('document'))
    return <FileTextIcon size={14} className="text-chart-2" />
  if (mediaType.includes('text') || mediaType.includes('plain'))
    return <FileTextIcon size={14} className="text-chart-2" />
  return <FileIcon size={14} className="text-chart-2" />
}

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
              <div>
                {message.parts.map((part, index) => {
                  switch (part.type) {
                    // no reasoning or tool calls here
                    case 'text': {
                      const { text, attachments } = parseTextWithAttachments(
                        part.text,
                      )
                      return (
                        <div key={index}>
                          {attachments.length > 0 && isUserMessage && (
                            <div className="flex flex-wrap gap-2 mb-2 justify-end">
                              {attachments.map((attachment, idx) => (
                                <div
                                  key={idx}
                                  className="flex items-center gap-2 text-xs"
                                >
                                  <FileTextIcon
                                    size={14}
                                    className="text-chart-2"
                                  />
                                  <span>{attachment.filename}</span>
                                </div>
                              ))}
                            </div>
                          )}
                          <ChatMessageContent content={text} />
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
                    }
                    case 'file':
                      if (part.mediaType.startsWith('image/')) {
                        return (
                          <div className="mb-2 flex justify-end" key={index}>
                            <img
                              key={index}
                              src={part.url}
                              alt={part.filename}
                              className="w-16 h-16 rounded-xl"
                            />
                          </div>
                        )
                      }
                      return (
                        <div
                          className="flex items-center justify-end gap-2 mb-2"
                          key={index}
                        >
                          <span>{getFileIcon(part.mediaType)}</span>
                          <span className="text-xs"> {part.filename}</span>
                        </div>
                      )
                    default:
                      return null
                  }
                })}
              </div>
            </ChatMessage>
          )
        })
      )}
      {error && <div className="text-red-400">An error occured</div>}
    </>
  )
}

// MyChatMessage.whyDidYouRender = true
