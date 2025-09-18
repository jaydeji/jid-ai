import { useNavigate, useParams } from '@tanstack/react-router'
import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import { useEffect, useState } from 'react'
import { nanoid } from 'nanoid'
import type { MyUIMessage } from '@/types'
import { MyChat } from '@/components/chat'
import {
  queryClient,
  useChat as useChatHook,
  useUser,
} from '@/services/react-query/hooks'
import { config } from '@/services'
import { getAuthHeader } from '@/services/auth'
import { chatsKey } from '@/services/react-query/keys'

export const Chat = () => {
  const { chatId } = useParams({ strict: false })
  const { data } = useChatHook(chatId)
  const { data: user } = useUser()

  const navigate = useNavigate()

  const chatOptions = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({
      api: config.VITE_API_URL + '/chat',
      headers: ((): Record<string, string> => {
        const header = getAuthHeader()
        return header ? { Authorization: header } : {}
      })(),
      prepareSendMessagesRequest: ({ id, messages, body }) => {
        return {
          body: {
            id,
            message: messages[messages.length - 1],
            ...body,
          },
        }
      },
    }),
    onData: (dt) => {
      if (dt.type === 'data-id') {
        navigate({
          to: '/chats/$chatId',
          params: { chatId: (dt.data as any).id },
        })
      }
    },
    // generateId: crypto.randomUUID,
    generateId: () => crypto.randomUUID(),
  })

  const [text, setText] = useState<string>('')
  const [model, setModel] = useState<string>(
    user?.currentlySelectedModel || '', // openai/gpt-5-mini:flex
  )

  useEffect(() => {
    if (user?.currentlySelectedModel) {
      setModel(user.currentlySelectedModel)
    }
  }, [user?.currentlySelectedModel])

  useEffect(() => {
    chatOptions.clearError()
    // chatOptions.setMessages([])
  }, [chatId])

  useEffect(() => {
    // if (chatId && data) {
    //   chatOptions.setMessages(data.messages)
    // }
    // queryClient.invalidateQueries({ queryKey: chatsKey })
  }, [data])

  const handleSubmit = () => {
    chatOptions.sendMessage({ text }, { body: { model, chatId: data?.id } })
    setText('')
  }

  const isLoading = chatOptions.status === 'submitted'

  const handleSubmitMessage = () => {
    if (isLoading) {
      return
    }
    handleSubmit()
  }

  return (
    <MyChat
      chatOptions={chatOptions}
      setModel={setModel}
      model={model}
      isLoading={isLoading}
      handleSubmitMessage={handleSubmitMessage}
      setText={setText}
      text={text}
    />
  )
}
