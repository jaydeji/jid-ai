import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { useChat, useChat as useReactChat } from '@ai-sdk/react'
import { useEffect, useRef } from 'react'
import { useParams } from '@tanstack/react-router'
import { config } from '../config'
import { chatKey, chatsKey, modelKey, userKey } from './keys'
import { api } from '@/services/api'
import { useSharedChatContext } from '@/components/chat-context'
import { getOptions } from '@/helpers/ai'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 2000,
      retry: false,
      refetchOnWindowFocus: !config.DEV,
    },
  },
})

export const useChats = ({ enabled }: { enabled: boolean }) => {
  return useQuery({
    queryKey: chatsKey,
    queryFn: api.getChats,
    enabled,
  })
}

export const useModels = () => {
  return useQuery({
    queryKey: modelKey,
    queryFn: api.getModels,
    staleTime: Infinity,
  })
}

export const useUser = () => {
  return useQuery({
    queryKey: userKey,
    queryFn: api.getUser,
  })
}

// export const useMyChat = () => {
//   const { chatId } = useParams({ strict: false })

//   const { chat, clearChat } = useSharedChatContext()
//   const chatOptions = useReactChat({
//     chat,
//   })

//   const options = useQuery({
//     queryKey: chatKey(chatId!),
//     queryFn: () => api.getChat(chatId!),
//     enabled: !!chatId,
//   })

//   useEffect(() => {
//     // we need to clear the messages when we go to new chat
//     if (!chatId) clearChat()
//   }, [chatId])

//   useEffect(() => {
//     // this sets messages to [] when we send a new chat because we fetch immediately, and its still empty
//     // we need this to populate the chat when we refresh the page
//     // status should stop it from fetching when we have an ongoing request
//     if (options.data)
//       chatOptions.status === 'ready' &&
//         chatOptions.setMessages(options.data.messages)
//   }, [options.data])

//   return { options, chatOptions, chatId }
// }

// export const useMyChat = () => {
//   // streaming works here
//   const { chatId } = useParams({ strict: false })

//   const { messages, error, stop, sendMessage, status } = useChat({
//     ...getOptions(),
//   })

//   return { messages, error, stop, sendMessage, status, chatId }
// }

// slow but works
// export const useMyChat = () => {
//   const { chat } = useSharedChatContext()

//   const { chatId } = useParams({ strict: false })

//   const { messages, error, stop, sendMessage, status } = useChat({
//     chat,
//   })

//   return { messages, error, stop, sendMessage, status, chatId }
// }

// function usePrevious(value: any) {
//   const ref = useRef(undefined)
//   useEffect(() => {
//     ref.current = value
//   })
//   return ref.current
// }

export const useMyChat = () => {
  const { chat } = useSharedChatContext()

  const { chatId } = useParams({ strict: false })

  const { messages, error, stop, sendMessage, status } = useChat({
    chat,
  })

  return { messages, error, stop, sendMessage, status, chatId }
}

export const useSignUp = () => {
  return useMutation({
    mutationFn: api.signUp,
  })
}

export const userSignIn = () => {
  return useMutation({
    mutationFn: api.signIn,
  })
}
