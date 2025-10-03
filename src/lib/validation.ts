import { z } from 'zod';

// Contribution validation schema
export const contributionSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount too large'),
  message: z.string()
    .max(1000, 'Message must be less than 1000 characters')
    .optional()
});

// External submission validation schema  
export const externalSubmissionSchema = z.object({
  externalUrl: z.string()
    .url('Please enter a valid URL')
    .max(500, 'URL too long'),
  platformName: z.string()
    .max(100, 'Platform name too long')
    .optional(),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title must be less than 200 characters'),
  description: z.string()
    .max(2000, 'Description must be less than 2000 characters')
    .optional(),
  previewNotes: z.string()
    .max(1000, 'Preview notes must be less than 1000 characters')
    .optional()
});
