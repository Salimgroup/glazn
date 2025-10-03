import { z } from 'zod';

// Contribution validation schema
export const contributionSchema = z.object({
  amount: z.number()
    .positive('Amount must be positive')
    .max(1000000, 'Amount cannot exceed $1,000,000'),
  message: z.string()
    .max(1000, 'Message cannot exceed 1000 characters')
    .optional()
    .transform(val => val?.trim() || undefined),
});

// External submission validation schema
export const externalSubmissionSchema = z.object({
  externalUrl: z.string()
    .url('Please enter a valid URL')
    .max(500, 'URL cannot exceed 500 characters')
    .trim(),
  platformName: z.string()
    .max(100, 'Platform name cannot exceed 100 characters')
    .trim()
    .optional(),
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  description: z.string()
    .max(2000, 'Description cannot exceed 2000 characters')
    .trim()
    .optional(),
  previewNotes: z.string()
    .max(1000, 'Preview notes cannot exceed 1000 characters')
    .trim()
    .optional(),
});

// Bounty request validation schema
export const bountyRequestSchema = z.object({
  title: z.string()
    .min(1, 'Title is required')
    .max(200, 'Title cannot exceed 200 characters')
    .trim(),
  description: z.string()
    .min(1, 'Description is required')
    .max(5000, 'Description cannot exceed 5000 characters')
    .trim(),
  bounty: z.number()
    .nonnegative('Bounty must be positive')
    .max(1000000, 'Bounty cannot exceed $1,000,000'),
  minimumContribution: z.number()
    .nonnegative('Minimum contribution must be non-negative')
    .optional(),
});

export type ContributionInput = z.infer<typeof contributionSchema>;
export type ExternalSubmissionInput = z.infer<typeof externalSubmissionSchema>;
export type BountyRequestInput = z.infer<typeof bountyRequestSchema>;
