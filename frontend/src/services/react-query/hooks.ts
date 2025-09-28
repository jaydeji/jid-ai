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
    select: (dt) => {
      const msgs = reconcileMessages({
        chatId,
        prevMessages: messages,
        serverMessages: dt.messages,
      })

      setMessages(msgs)

      setModel(dt.model)

      return dt
    },
  })

  const { messages, setMessages } = useMyChat()

  const { setModel } = useStore()

  useEffect(() => {
    if (!data && !chatId) {
      setMessages([])
    }
  }, [data, chatId])

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

export const useMyChat = () => {
  const { chatId } = useParams({ strict: false })
  const { chat } = useStore()

  return useChat({
    chat,
    id: chatId,
  })
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
