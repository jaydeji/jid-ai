import { useEffect, useMemo, useRef, useState } from 'react'
import { useParams } from '@tanstack/react-router'
import { useChat } from '@ai-sdk/react'
import { FileIcon, FileTextIcon, XCircleIcon } from 'lucide-react'
import { MyChatMessage } from './chat-message'
import {
  ChatInput,
  ChatInputSubmit,
  ChatInputTextArea,
} from '@/components/ui/chat-input'
import { ChatMessageArea } from '@/components/ui/chat-message-area'
import { UsageStats } from '@/components/ui/usage-stats'
import { BottomBar } from '@/templates/BottomBar'
import { useStore } from '@/store'
import { reconcileMessages } from '@/helpers/ai'
import { useChatQuery } from '@/services/react-query/hooks'
import { cn } from '@/lib/utils'

function useChatMessages(chatId: string | undefined) {
  const chat = useStore((state) => state.chat)
  const { setMessages, messages, clearError } = useChat({ chat })

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
      clearError()
    }

    // clear messages when we move from  chat Id to no chatId i.e new chat
    if (previousChatId && !chatId) {
      setMessages([])
      clearError()
    }

    // Update ref for next comparison
    oldChatId.current = chatId
  }, [chatId])
}

export function ChatPage() {
  const [text, setText] = useState<string>('')

  const modelParameters = useStore((state) => state.modelParameters)
  const model = useStore((state) => state.model)
  const files = useStore((state) => state.files)
  const removeFile = useStore((state) => state.removeFile)
  const clearFiles = useStore((state) => state.clearFiles)

  const { chatId } = useParams({ strict: false })

  const chat = useStore((state) => state.chat)
  const { sendMessage, status, stop } = useChat({ chat })

  const handleSubmit = () => {
    sendMessage(
      { text, files },
      {
        body: { model, chatId, modelParameters, createdAt: new Date() },
      },
    )
    setText('')
    clearFiles()
  }

  const isLoading = status === 'streaming'

  const handleSubmitMessage = () => {
    if (isLoading) {
      return
    }
    handleSubmit()
  }

  const getFileIcon = (mediaType: any) => {
    if (mediaType.includes('pdf') || mediaType.includes('document'))
      return <FileTextIcon size={14} />
    return <FileIcon size={14} />
  }

  useChatMessages(chatId)

  return (
    <div className="flex-1 flex flex-col h-full min-h-0 bg-background overflow-hidden">
      <ChatMessageArea scrollButtonAlignment="center">
        <div className="max-w-2xl mx-auto w-full px-4 py-8 space-y-4">
          <MyChatMessage />
        </div>
      </ChatMessageArea>
      <div className="px-2 pt-4 py-1 md:py-4 max-w-2xl mx-auto w-full shrink-0">
        <ChatInput
          value={text}
          onChange={(e) => setText(e.target.value)}
          onSubmit={handleSubmitMessage}
          loading={isLoading}
          onStop={stop}
        >
          <UsageStats />
          <BottomBar className="mb-2" />
          <ChatInputTextArea
            placeholder="Type a message..."
            className={cn(files.length > 0 && 'rounded-t-none')}
          >
            <ChatInputSubmit
              className="absolute bottom-0 right-0 mr-1 mb-1 cursor-pointer"
              loading={isLoading}
              onStop={stop}
            />
            <div
              className={cn(
                'hidden',
                files.length &&
                  'bg-[#1D1D22] flex gap-2 items-center px-3 py-1 rounded-t-md',
              )}
            >
              {files.map((file, index) => (
                <div
                  key={index}
                  className="flex items-start relative hover:text-accent-foreground"
                >
                  {file.mediaType.startsWith('image/') ? (
                    <img
                      src={file.url}
                      alt="preview"
                      className="w-12 rounded h-12 border border-input hover:border-input/50"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded flex items-center justify-center border border-input hover:border-input/50">
                      {getFileIcon(file.mediaType)}
                    </div>
                  )}
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute -top-1 -right-1 cursor-pointer "
                  >
                    <XCircleIcon size={16} className="bg-border z-10" />
                  </button>
                </div>
              ))}
            </div>
          </ChatInputTextArea>
        </ChatInput>
      </div>
    </div>
  )
}

// ChatPage.whyDidYouRender = true
