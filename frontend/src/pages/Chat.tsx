import { useNavigate, useParams } from '@tanstack/react-router'
import { DefaultChatTransport, generateId } from 'ai'
import { useChat } from '@ai-sdk/react'
import { useEffect, useState } from 'react'
import type { MyUIMessage } from '@/types'
import { MyChat } from '@/components/chat'
import {
  queryClient,
  useChat as useChatHook,
} from '@/services/react-query/hooks'
import { config } from '@/services'
import { getAuthHeader } from '@/services/auth'
import { chatsKey } from '@/services/react-query/keys'

export const Chat = () => {
  const { chatId } = useParams({ strict: false })
  const { data } = useChatHook(chatId)

  const chatOptions = useChat<MyUIMessage>({
    transport: new DefaultChatTransport({
      api: config.VITE_API_URL + '/chat',
      headers: ((): Record<string, string> => {
        const header = getAuthHeader()
        return header ? { Authorization: header } : {}
      })(),
    }),
    onFinish: () => console.log('finished'),
  })

  const navigate = useNavigate()

  const [text, setText] = useState<string>('')
  const [model, setModel] = useState<string>(
    'nvidia/nemotron-nano-9b-v2:free', // openai/gpt-5-mini:flex
  )

  useEffect(() => {
    if (!chatId) {
      chatOptions.setMessages([])
    }
  }, [chatId])

  useEffect(() => {
    if (chatId && data) {
      chatOptions.setMessages(data.messages)
    }

    queryClient.invalidateQueries({ queryKey: chatsKey })
  }, [data])

  const handleSubmit = () => {
    const chat_id = data?.id ? data.id : generateId()

    chatOptions.sendMessage({ text }, { body: { model, chatId: chat_id } })
    setText('')

    navigate({
      to: '/chats/$chatId',
      params: { chatId: chat_id },
    })
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
