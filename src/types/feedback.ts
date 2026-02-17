import { z } from 'zod'

export const FEEDBACK_TYPES = [
  { value: 'bug', label: 'Bug Report' },
  { value: 'feature', label: 'Feature Request' },
  { value: 'opportunity', label: 'Suggest Opportunity' },
  { value: 'general', label: 'General Feedback' },
] as const

export type FeedbackType = (typeof FEEDBACK_TYPES)[number]['value']

export const feedbackSchema = z.object({
  name: z.string().optional(),
  email: z.union([z.string().email('Please enter a valid email'), z.literal('')]).optional(),
  type: z.enum(['bug', 'feature', 'opportunity', 'general']),
  message: z.string().min(10, 'Please provide at least 10 characters of feedback'),
})

export type FeedbackData = z.infer<typeof feedbackSchema>

export interface StoredFeedback extends FeedbackData {
  id: string
  createdAt: string
}
