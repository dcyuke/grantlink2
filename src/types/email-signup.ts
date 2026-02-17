import { z } from 'zod'

export const alertPreferenceSchema = z.enum(['similar_only', 'all_grants'])

export const emailSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  focusAreas: z.array(z.string()).optional(),
  alertPreference: alertPreferenceSchema.optional().default('all_grants'),
})

export type AlertPreference = z.infer<typeof alertPreferenceSchema>
export type EmailSignupData = z.infer<typeof emailSignupSchema>

export interface StoredSignup extends EmailSignupData {
  id: string
  createdAt: string
}
