import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { useChat as useReactChat } from '@ai-sdk/react'
import { useEffect } from 'react'
import { chatKey, chatsKey, modelKey, userKey } from './keys'
import { api } from '@/services/api'
import { useSharedChatContext } from '@/components/chat-context'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      gcTime: 1000 * 60 * 60 * 24, // 24 hours
      staleTime: 2000,
      retry: false,
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

export const useChat = (chatId?: string) => {
  const { chat, clearChat } = useSharedChatContext()
  const chatOptions = useReactChat({
    chat,
  })

  const options = useQuery({
    queryKey: chatKey(chatId!),
    queryFn: () => api.getChat(chatId!),
    enabled: !!chatId,
  })

  useEffect(() => {
    // we need to clear the messages when we go to new chat
    if (!chatId) clearChat()
  }, [chatId])

  useEffect(() => {
    // this sets messages to [] when we send a new chat because we fetch immediately, and its still empty
    // we need this to populate the chat when we refresh the page
    // status should stop it from fetching when we have an ongoing request
    if (options.data)
      chatOptions.status === 'ready' &&
        chatOptions.setMessages(options.data.messages)
  }, [options.data])

  return options
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
