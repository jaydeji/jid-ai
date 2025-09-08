import { cache } from '../cache.js';

export const users = [
  {
    userId: 'google:110510818893952848592',
    userName: 'Babajide',
    email: 'jyde.dev@gmail.com',
    avatar: '',
    additionalInfo:
      'Never use this symbol "—". Don’t reference my occupation unless absolutely necessary',
    currentModelParameters: {
      includeSearch: true,
      reasoningEffort: 'high',
    },
    currentlySelectedModel: 'openai/gpt-5-mini:flex',
    disableExternalLinkWarning: true,
    favoriteModels: ['gemini-2.5-flash', 'gpt-5-chat'],
  },
];

cache.setKey('users', users);
cache.setKey('chats', []);
cache.save();
