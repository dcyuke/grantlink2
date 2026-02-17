import { z } from 'zod'

export const emailSignupSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  focusAreas: z.array(z.string()).optional(),
})

export type EmailSignupData = z.infer<typeof emailSignupSchema>

export interface StoredSignup extends EmailSignupData {
  id: string
  createdAt: string
}
