import { QueryClient, useQuery } from '@tanstack/react-query'
import { chatKey, chatsKey, modelKey, userKey } from './keys'
import { api } from '@/services/api'

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
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
  return useQuery({
    queryKey: chatKey(chatId!),
    queryFn: () => api.getChat(chatId!),
    enabled: !!chatId,
  })
}
