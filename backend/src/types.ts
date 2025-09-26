export type OpenAICallData = {
  id: string;
  total_cost: number;
  created_at: string;
  model: string;
  origin: string;
  usage: number; // This might be total_tokens, or a derived usage metric
  is_byok: boolean;
  upstream_id: string;
  cache_discount: number;
  upstream_inference_cost: number;
  app_id: number;
  streamed: boolean;
  cancelled: boolean;
  provider_name: string;
  latency: number; // In milliseconds or seconds, depending on the source
  moderation_latency: number; // In milliseconds or seconds
  generation_time: number; // In milliseconds or seconds
  finish_reason: string; // e.g., "stop", "length", "content_filter"
  native_finish_reason: string;
  tokens_prompt: number;
  tokens_completion: number;
  native_tokens_prompt: number;
  native_tokens_completion: number;
  native_tokens_reasoning: number;
  num_media_prompt: number; // e.g., for vision models
  num_media_completion: number;
  num_search_results: number;
};

export type Usage = {
  promptTokens: number;
  promptTokensDetails: {
    cachedTokens: number;
  };
  completionTokens: number;
  completionTokensDetails: {
    reasoningTokens: number;
  };
  cost: number;
  totalTokens: number;
};

export type OpenAICallResponse = {
  data: OpenAICallData;
};

export const AppErrors = {
  CHAT_NOT_FOUND: {
    message: 'chat not found',
    status: 404,
  },
  USER_NOT_FOUND: {
    message: 'User not found',
    status: 404,
  },
  INTERNAL_ERROR: {
    message: 'Internal Server Error',
    status: 500,
  },
  BAD_REQUEST: {
    message: 'Bad Request',
    status: 400,
  },
  UNAUTHORIZED: {
    message: 'Unauthorized',
    status: 401,
  },
  CREDITS_EXPIRED: {
    message: 'You have run out of credits',
    status: 403,
  },
} as const;

export type AppErrorKey = keyof typeof AppErrors;

export type OpenRouterModelInfo = {
  id: string;
  canonical_slug: string;
  hugging_face_id: string;
  name: string;
  created: number;
  description: string;
  context_length: number;
  architecture: {
    modality: string;
    input_modalities: string[];
    output_modalities: string[];
    tokenizer: string;
    instruct_type: string | null;
  };
  pricing: {
    prompt: string;
    completion: string;
    request: string;
    image: string;
    web_search: string;
    internal_reasoning: string;
  };
  top_provider: {
    context_length: number;
    max_completion_tokens: number;
    is_moderated: boolean;
  };
  per_request_limits: unknown | null;
  supported_parameters: string[];
};

export type UserRole = 'user' | 'admin';
export type ModelParameters = {
  includeSearch: boolean;
  reasoningEffort: 'low' | 'medium' | 'high';
};
