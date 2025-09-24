import { create } from 'zustand'
import type { Chat as ReactChat } from '@ai-sdk/react'
import type { MyUIMessage, User } from '@/types'
import { createChat } from '@/helpers/ai'
import { queryClient } from '@/services'
import { userKey } from '@/services/react-query/keys'

interface ChatState {
  chat: ReactChat<MyUIMessage>
  model: string
  clearChat: () => void
  setModel: (model: string) => void
  // increasePopulation: () => void
  // removeAllBears: () => void
  // updateBears: (newBears: number) => void
}

export const useStore = create<ChatState>((set) => ({
  chat: createChat(),
  model: 'meta-llama/llama-3.2-3b-instruct',
  clearChat: () => {
    set(() => ({ chat: createChat() }))
  },
  setModel: (model: string) => {
    const user =
      queryClient.getQueryData<User>(userKey)?.currentlySelectedModel ?? ''
    set(() => ({
      model: model || user,
    }))
  },

  // increasePopulation: () => set((state) => ({ bears: state.bears + 1 })),
  // removeAllBears: () => set({ bears: 0 }),
  // updateBears: (newBears) => set({ bears: newBears }),
}))
