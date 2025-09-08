import { z } from 'zod'
import type { UIMessage } from 'ai'

export type User = {
  userId: string
  userName: string
  email: string
  avatar: string
  currentlySelectedModel: string
  favoriteModels: Array<string>
}

export type Model = {
  id: string
  object: 'model'
  created: number
  owned_by: string
  input_price: number
  caching_price: number
  cached_price: number
  output_price: number
  max_output_tokens: number
  context_window: number
  supports_caching: boolean
  supports_vision: boolean
  supports_computer_use: boolean
  supports_reasoning: boolean
  description: string
}

export type Models = {
  object: 'list'
  data: Array<Model>
}

export type Chat = {
  id: string
  createdAt: 1757313146055
  title: 'Adding Search Functionality to React Component with Dropdown Menu'
  updatedAt: 1757314442518
  userSetTitle: false
}

export type GroupedModels = Record<string, Array<Model>>

// Define your metadata schema
export const messageMetadataSchema = z.object({
  // createdAt: z.number().optional(),
  // model: z.string().optional(),
  totalTokens: z.number().optional(),
})

export type MessageMetadata = z.infer<typeof messageMetadataSchema>

// Create a typed UIMessage
export type MyUIMessage = UIMessage<MessageMetadata>
