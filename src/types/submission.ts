import { z } from 'zod'

export const funderInfoSchema = z.object({
  funder_name: z.string().min(1, 'Organization name is required'),
  funder_type: z.enum([
    'private_foundation',
    'community_foundation',
    'corporate',
    'government_federal',
    'government_state',
    'government_local',
    'individual_donor',
    'impact_investor',
    'international_org',
    'other',
  ]),
  website_url: z.string().url('Please enter a valid URL').optional().or(z.literal('')),
  contact_email: z.string().email('Please enter a valid email'),
  funder_description: z.string().optional().or(z.literal('')),
})

export const opportunityDetailsSchema = z.object({
  title: z.string().min(1, 'Opportunity title is required'),
  summary: z.string().min(10, 'Please provide a brief summary (at least 10 characters)'),
  description: z.string().optional().or(z.literal('')),
  opportunity_type: z.enum([
    'grant',
    'fellowship',
    'prize',
    'competition',
    'corporate_giving',
    'impact_investment',
    'scholarship',
    'award',
    'residency',
    'accelerator',
    'other',
  ]),
  amount_min: z.number().min(0).nullable().optional(),
  amount_max: z.number().min(0).nullable().optional(),
  deadline_date: z.string().optional().or(z.literal('')),
  deadline_type: z.enum(['fixed', 'rolling', 'continuous', 'unknown']).optional().default('fixed'),
  application_url: z.string().url('Please enter a valid application URL').optional().or(z.literal('')),
})

export const eligibilitySchema = z.object({
  eligibility_summary: z.string().optional().or(z.literal('')),
  focus_areas: z.array(z.string()).optional().default([]),
  eligible_geography: z.array(z.string()).optional().default([]),
  eligible_populations: z.array(z.string()).optional().default([]),
  eligible_org_types: z.array(z.string()).optional().default([]),
  geo_scope_display: z.string().optional().or(z.literal('')),
})

export const submissionSchema = funderInfoSchema
  .merge(opportunityDetailsSchema)
  .merge(eligibilitySchema)

export type FunderInfo = z.infer<typeof funderInfoSchema>
export type OpportunityDetails = z.infer<typeof opportunityDetailsSchema>
export type EligibilityInfo = z.infer<typeof eligibilitySchema>
export type SubmissionData = z.infer<typeof submissionSchema>
