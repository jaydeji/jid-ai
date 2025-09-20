type OpenAICallData = {
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

type OpenAICallResponse = {
  data: OpenAICallData;
};

const AppErrors = {
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
} as const;

type AppErrorKey = keyof typeof AppErrors;
