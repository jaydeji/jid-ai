import { useNavigate, useParams } from '@tanstack/react-router'
import { DefaultChatTransport } from 'ai'
import { useChat } from '@ai-sdk/react'
import { useEffect, useRef, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import type { Chat, MyUIMessage } from '@/types'
import { MyChat } from '@/components/chat'
import { useChat as useChatHook, useUser } from '@/services/react-query/hooks'
import { config } from '@/services'
import { getAuthHeader } from '@/services/auth'
import { chatKey, chatsKey } from '@/services/react-query/keys'
import { useSharedChatContext } from '@/components/chat-context'

// export const ChatPage = () => {
//   const { chatId } = useParams({ strict: false })
//   const { data } = useChatHook(chatId)

//   // key the child by chatId (or 'new') so it remounts when chatId changes
//   return <ChatInstance key={chatId ?? 'new'} chatId={chatId} data={data} />
// }

export function ChatPage() {
  const [text, setText] = useState<string>('')
  const { data: user } = useUser()
  const [model, setModel] = useState<string>(
    user?.currentlySelectedModel || '', // openai/gpt-5-mini:flex
  )
  const { chatId } = useParams({ strict: false })

  const { data } = useChatHook(chatId)
  const queryClient = useQueryClient()
  const navigate = useNavigate()

  const { chat, clearChat } = useSharedChatContext()
  const chatOptions = useChat({
    chat,
  })

  // const chatOptions = useChat<MyUIMessage>({
  //   id: chatId ?? undefined,
  //   messages: data?.messages,
  //   transport: new DefaultChatTransport({
  //     api: config.VITE_API_URL + '/chat',
  //     headers: ((): Record<string, string> => {
  //       const header = getAuthHeader()
  //       return header ? { Authorization: header } : {}
  //     })(),
  //     prepareSendMessagesRequest: ({ id, messages, body }) => {
  //       return {
  //         body: {
  //           id,
  //           message: messages[messages.length - 1],
  //           ...body,
  //         },
  //       }
  //     },
  //   }),
  //   onData: (dt) => {
  //     console.log({ dt })
  //     if (dt.type === 'data-id') {
  //       navigate({
  //         to: '/chats/$chatId',
  //         params: { chatId: (dt.data as any).id },
  //       })
  //     }
  //     if (dt.type === 'data-generate-title') {
  //       if (chatId) {
  //         queryClient.setQueryData<Chat>(chatKey(chatId), (chat) => {
  //           console.log(chat)
  //           if (!chat) return chat
  //           return { ...chat, title: (dt.data as any)?.title }
  //         })
  //       }
  //     }
  //   },
  //   generateId: () => crypto.randomUUID(),
  // })

  // When ChatInstance mounts as a "new chat" instance, clear messages & errors.
  // Because ChatInstance is keyed by chatId, switching chatId will remount this component,
  // so this effect runs on each remount.
  // useEffect(() => {
  //   if (!chatId) {
  //     chatOptions.setMessages([])
  //     chatOptions.clearError()
  //     queryClient.invalidateQueries({ queryKey: chatsKey })
  //   }
  //   // Intentionally empty deps to run once on mount of this ChatInstance
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [])

  // // When server data arrives for an existing chat, populate messages
  // useEffect(() => {
  //   if (data && chatId) {
  //     chatOptions.setMessages(data.messages)
  //   }
  //   // chatOptions is stable from the hook; include data and chatId as deps
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, [data, chatId])

  // useEffect(() => {
  //   console.log('messages', data)
  //   if (data?.messages?.length) {
  //     chatOptions.setMessages(data.messages)
  //     console.log('here', chatOptions.id)
  //   }
  // }, [data?.messages])

  useEffect(() => {
    if (!model && user?.currentlySelectedModel) {
      setModel(user.currentlySelectedModel)
    }
  }, [user?.currentlySelectedModel])

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
