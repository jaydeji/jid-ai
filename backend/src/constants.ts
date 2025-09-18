import { createOpenRouter } from '@openrouter/ai-sdk-provider';
import { config } from './config';

export const consts = { SALT_ROUNDS: 10 };

export const openrouter = createOpenRouter({
  apiKey: config.OPEN_ROUTER_API_KEY,
});
