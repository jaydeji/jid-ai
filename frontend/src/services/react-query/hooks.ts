import { QueryClient, useMutation, useQuery } from '@tanstack/react-query'
import { useChat } from '@ai-sdk/react'
import { useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { config } from '../config'
import { chatKey, chatsKey, modelKey, userKey } from './keys'
import { api } from '@/services/api'
import { useSharedChatContext } from '@/components/chat-context'

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

export const useMyChat = () => {
  const { chat, clearChat } = useSharedChatContext()
  const { chatId } = useParams({ strict: false })

  const { messages, error, stop, sendMessage, status, setMessages } = useChat({
    chat,
    id: chatId, // fixes streaming
  })

  // Only fetch when we have a chatId and haven't loaded this chat yet
  const shouldFetch = !!chatId

  const chatQuery = useQuery({
    queryKey: chatKey(chatId!),
    queryFn: async () => {
      const data = await api.getChat(chatId!)
      setMessages(data.messages)
      return data
    },
    enabled: shouldFetch,
    staleTime: Infinity, // Don't refetch once loaded
  })

  useEffect(() => {
    return () => setMessages([])
  }, [])

  return {
    messages,
    error,
    stop,
    sendMessage,
    status,
    chatId,
    isLoadingInitialData: chatQuery.isLoading,
  }
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
