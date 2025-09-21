import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { config } from './config';

export const consts = {
  SALT_ROUNDS: 10,
  TITLE_GEN_MODEL: 'x-ai/grok-4-fast:free', //'meta-llama/llama-3.2-1b-instruct'
};

export const openrouter = createOpenRouter({
  apiKey: config.OPEN_ROUTER_API_KEY,
});
