import { create } from 'zustand'
import type { Chat as ReactChat } from '@ai-sdk/react'
import type { ModelParameters, MyUIMessage, User } from '@/types'
import { createChat } from '@/helpers/ai'
import { queryClient } from '@/services'
import { userKey } from '@/services/react-query/keys'

interface ChatState {
  chat: ReactChat<MyUIMessage>
  model: string
  modelParameters: ModelParameters | null
  clearChat: () => void
  setModel: (model: string) => void
  setModelParameters: (params: ModelParameters | null) => void
}

export const useStore = create<ChatState>((set) => ({
  chat: createChat(),
  model: '',
  modelParameters: null,
  clearChat: () => {
    set(() => ({ chat: createChat() }))
  },
  setModel: (model: string) => {
    const currentlySelectedModel =
      queryClient.getQueryData<User>(userKey)?.currentlySelectedModel ?? ''
    set(() => ({
      model: model || currentlySelectedModel,
    }))
  },
  setModelParameters: (params: ModelParameters | null) => {
    const currentModelParameters =
      queryClient.getQueryData<User>(userKey)?.currentModelParameters ?? null
    set(() => ({
      modelParameters: params || currentModelParameters,
    }))
  },
}))
