import { cache } from '../cache';

export const users = [
  {
    userId: 'google:110510818893952848592',
    firstName: 'Test1',
    lastName: 'Test',
    email: 'test1@gmail.com',
    avatar: '',
    additionalInfo:
      'Never use this symbol "—". Don’t reference my occupation unless absolutely necessary',
    currentModelParameters: {
      includeSearch: true,
      reasoningEffort: 'high',
    },
    currentlySelectedModel: 'nvidia/nemotron-nano-9b-v2:free',
    disableExternalLinkWarning: true,
    favoriteModels: [
      'nvidia/nemotron-nano-9b-v2:free',
      'deepseek/deepseek-r1:free',
    ],
  },
];

cache.setKey('users', users);
cache.setKey('chats', []);
cache.save();
