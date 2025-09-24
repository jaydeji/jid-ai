import { z } from 'zod'
import type { UIMessage } from 'ai'

export type User = {
  userId: string
  firstName: string
  lastName: string
  email: string
  avatar: string
  currentlySelectedModel: string
  favoriteModels: Array<string>
  credits: string
  role: 'user' | 'admin'
}

export interface ModelArchitecture {
  modality: string // e.g., "text->text"
  input_modalities: Array<'text' | 'audio' | 'image' | 'file' | string> //  The kinds of input the model can accept (e.g., text, image, etc.).
  output_modalities: Array<string> // The kinds of output the model produces (e.g., text).
  tokenizer: string // The tokenization scheme the model uses to convert text into tokens e.g. GPT
  instruct_type: string | null
}

export interface ModelPricing {
  prompt: string // input price
  completion: string // output price
  request: string // pricing.request is typically the per-call (per-request) overhead fee charged just for making an API request, regardless of how many tokens you send or receive.
  image: string
  web_search: string
  internal_reasoning: string
}

export interface TopProvider {
  context_length: number
  max_completion_tokens: number | null
  is_moderated: boolean
}

export interface OpenModel {
  id: string
  canonical_slug: string
  hugging_face_id: string
  name: string
  created: number
  description: string
  context_length: number // The maximum input length (in tokens)
  architecture: ModelArchitecture
  pricing: ModelPricing
  top_provider: TopProvider
  per_request_limits: any // null in your example; adjust if you know the shape
  supported_parameters: Array<string>
}

export type RequestyModel = {
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

export type Model = OpenModel

export type Models = {
  object: 'list'
  data: Array<Model>
}

export type Usage = {
  inputTokens: number
  outputTokens: number
  totalTokens: number
  totalCost: number
}

export type Chat = Usage & {
  id: string
  createdAt: number
  title: string
  updatedAt: number
  userSetTitle: boolean
  messages?: Array<any>
  outputCost: string
  model: string
}

export type GroupedModels = Record<string, Array<Model>>

// Define your metadata schema
export const messageMetadataSchema = z.object({
  model: z.string(),
  createdAt: z.date().optional(),
  id: z.string(),
  chatId: z.string(),
})

export type MessageMetadata = z.infer<typeof messageMetadataSchema>

// Create a typed UIMessage
export type MyUIMessage = UIMessage & MessageMetadata
