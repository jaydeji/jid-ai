import { z } from 'zod';

// Zod schema for the user insert payload
export const userSignUpSchema = z.object({
  firstName: z.string().min(1, 'First name is required.'),
  lastName: z.string().min(1, 'Last name is required.'),
  password: z.string(),
  //   .min(8, 'Password must be at least 8 characters long.'),
  email: z
    .string()
    .email('Invalid email address.')
    .min(1, 'Email is required.'),
  avatar: z
    .string()
    .url('Avatar must be a valid URL.')
    .optional()
    .or(z.literal('')), // Allows empty string or valid URL

  // additionalInfo is optional
  //   additionalInfo: z.string().optional(),

  // currentModelParameters is optional and defaults to a valid object if not provided
  //   currentModelParameters: CurrentModelParametersSchema.optional(),

  currentlySelectedModel: z.string().optional(),
  // .min(1, 'Currently selected model is required.'),

  // disableExternalLinkWarning is a new optional boolean
  //   disableExternalLinkWarning: z.boolean().optional(),

  favoriteModels: z
    .array(z.string().min(1, 'Model name cannot be empty.'))
    .optional(),
});

export const userSignInSchema = z.object({
  password: z.string(),
  email: z
    .string()
    .email('Invalid email address.')
    .min(1, 'Email is required.'),
});

// Example Usage:
// const validPayload = {
//   firstName: 'Test1',
//   lastName: 'Test',
//   email: 'test1@gmail.com',
//   avatar: '',
//   additionalInfo: 'Some info',
//   currentModelParameters: {
//     includeSearch: true,
//     reasoningEffort: 'high',
//   },
//   currentlySelectedModel: 'nvidia/nemotron-nano-9b-v2:free',
//   disableExternalLinkWarning: false,
//   favoriteModels: ['modelA', 'modelB'],
//   externalAuthId: 'google:12345'
// };

// const invalidPayload = {
//   firstName: '', // Missing first name
//   email: 'invalid-email', // Invalid email format
// };
