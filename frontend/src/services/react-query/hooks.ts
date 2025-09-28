import { useMutation, useQuery } from '@tanstack/react-query'
import { useChat } from '@ai-sdk/react'
import { useEffect, useMemo } from 'react'
import { useParams } from '@tanstack/react-router'
import { chatKey, chatsKey, modelKey, userKey } from './keys'
import { api } from '@/services/api'
import { useStore } from '@/store'
import { reconcileMessages } from '@/helpers/ai'

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
  const { setModel, model } = useStore()
  const query = useQuery({
    queryKey: userKey,
    queryFn: api.getUser,
  })

  useEffect(() => {
    if (!model && query.isSuccess) {
      setModel(query.data.currentlySelectedModel)
    }
  }, [query.isSuccess])

  return query
}

export const useChatData = () => {
  const { chatId } = useParams({ strict: false })

  const { data, isLoading } = useQuery({
    queryKey: chatKey(chatId!),
    queryFn: () => api.getChat(chatId!),
    enabled: !!chatId,
  })

  return {
    inputTokens: data?.inputTokens,
    outputTokens: data?.outputTokens,
    totalTokens: data?.totalTokens,
    totalCost: data?.totalCost,
    serverMessages: data?.messages,
    title: data?.title,
    data,
    isLoading,
  }
}

// Messages-specific hook that uses the base hook
export const useChatMessages = () => {
  const { chatId } = useParams({ strict: false })
  const { chat, setModel } = useStore()
  const { data, isLoading } = useChatData()

  const { messages, error, stop, sendMessage, status, setMessages } = useChat({
    chat,
    id: chatId,
  })

  useEffect(() => {
    if (data) {
      setMessages(
        reconcileMessages({
          chatId,
          prevMessages: messages,
          serverMessages: data.messages,
        }),
      )
      setModel(data.model)
    }

    if (!data && !chatId) {
      setMessages([])
    }
  }, [data, chatId])

  return {
    messages,
    error,
    stop,
    sendMessage,
    status,
    chatId,
    isLoadingInitialData: isLoading,
    data,
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
