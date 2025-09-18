import { useNavigate, useParams } from '@tanstack/react-router'
import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import { useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Chat, MyUIMessage } from '@/types'
import { MyChat } from '@/components/chat'
import { useChat as useChatHook, useUser } from '@/services/react-query/hooks'
import { config } from '@/services'
import { getAuthHeader } from '@/services/auth'
import { chatKey, chatsKey } from '@/services/react-query/keys'

export const ChatPage = () => {
  const { chatId } = useParams({ strict: false })
  const { data } = useChatHook(chatId)
  const { data: user } = useUser()
  const queryClient = useQueryClient()

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
      console.log({ dt })
      if (dt.type === 'data-id') {
        navigate({
          to: '/chats/$chatId',
          params: { chatId: (dt.data as any).id },
        })
      }
      if (dt.type === 'data-generate-title') {
        if (chatId) {
          queryClient.setQueryData<Chat>(chatKey(chatId), (chat) => {
            console.log(chat)
            if (!chat) return chat
            return { ...chat, title: (dt.data as any)?.title }
          })
        }
      }
    },
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
    if (!chatId) {
      chatOptions.setMessages([])
    }
    chatOptions.clearError()

    queryClient.invalidateQueries({ queryKey: chatsKey })
  }, [chatId])

  useEffect(() => {
    if (data && chatId) {
      chatOptions.setMessages(data.messages)
    }
  }, [data, chatId])

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
