import { create } from 'zustand'
import type { Chat as ReactChat } from '@ai-sdk/react'
import type { ModelParameters, MyUIMessage, User } from '@/types'
import type { FileUIPart } from 'ai'
import { createChat } from '@/helpers/ai'
import { queryClient } from '@/services'
import { userKey } from '@/services/react-query/keys'

interface TextAttachment {
  filename: string
  content: string
}

interface ChatState {
  chat: ReactChat<MyUIMessage>
  model: string
  modelParameters: ModelParameters | null
  files: Array<FileUIPart>
  textAttachments: Array<TextAttachment>
  clearChat: () => void
  setModel: (model: string) => void
  setModelParameters: (params: ModelParameters | null) => void
  setFiles: (files: Array<FileUIPart>) => void
  removeFile: (index: number) => void
  clearFiles: () => void
  setTextAttachments: (attachments: Array<TextAttachment>) => void
  removeTextAttachment: (index: number) => void
  clearTextAttachments: () => void
}

export const useStore = create<ChatState>((set) => ({
  chat: createChat(),
  model: '',
  modelParameters: null,
  files: [],
  textAttachments: [],
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
  setFiles: (files) => {
    set((state) => ({ files: [...state.files, ...files] }))
  },
  clearFiles: () => {
    set(() => ({ files: [] }))
  },
  removeFile: (index: number) => {
    set((state) => ({ files: state.files.filter((_, i) => i !== index) }))
  },
  setTextAttachments: (attachments) => {
    set((state) => ({
      textAttachments: [...state.textAttachments, ...attachments],
    }))
  },
  clearTextAttachments: () => {
    set(() => ({ textAttachments: [] }))
  },
  removeTextAttachment: (index: number) => {
    set((state) => ({
      textAttachments: state.textAttachments.filter((_, i) => i !== index),
    }))
  },
}))
