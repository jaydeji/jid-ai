import { z } from 'zod';

// If you have a separate schema for messages, define it here
const messageSchema = z.object({
  id: z.string().uuid(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  createdAt: z.date(),
});

export const chatSchema = z.object({
  id: z.string().uuid(), // assuming chatId is UUID
  createdAt: z.date(),
  updatedAt: z.date(),
  title: z.string().default('New Chat'),
  model: z.string(), // adjust if you have fixed models -> z.enum([...])
  generationStatus: z
    .enum(['completed', 'pending', 'failed'])
    .default('pending'),
  branchParent: z.string().uuid().nullable(),
  pinned: z.boolean().default(false),
  // threadId: z.string().uuid().optional(),
  userSetTitle: z.boolean().default(false),
  messages: z.array(messageSchema),
});

// Type inference from schema
export type Chat = z.infer<typeof chatSchema>;
