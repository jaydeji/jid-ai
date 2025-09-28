import { useMutation, useQuery } from '@tanstack/react-query'
import { useEffect } from 'react'
import { useParams } from '@tanstack/react-router'
import { chatKey, chatsKey, modelKey, userKey } from './keys'
import { api } from '@/services/api'
import { useStore } from '@/store'

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
      setModel(
        query.data.currentlySelectedModel || 'meta-llama/llama-3.2-3b-instruct',
      )
    }
  }, [query.isSuccess])

  return query
}

export const useChatQuery = () => {
  const { chatId } = useParams({ strict: false })

  const shouldFetch = !!chatId

  const { isPending, data } = useQuery({
    queryKey: chatKey(chatId!),
    queryFn: () => api.getChat(chatId!),
    enabled: shouldFetch,
  })

  return {
    isPending,
    data,
    inputTokens: data?.inputTokens,
    outputTokens: data?.outputTokens,
    totalTokens: data?.totalTokens,
    totalCost: data?.totalCost,
    serverMessages: data?.messages,
    title: data?.title,
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
