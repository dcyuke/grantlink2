import type { OpportunityType, FunderType, ApplicationComplexity } from '@/types/opportunity'

export const OPPORTUNITY_TYPE_LABELS: Record<OpportunityType, string> = {
  grant: 'Grant',
  fellowship: 'Fellowship',
  prize: 'Prize',
  competition: 'Competition',
  corporate_giving: 'Corporate Giving',
  impact_investment: 'Impact Investment',
  scholarship: 'Scholarship',
  award: 'Award',
  residency: 'Residency',
  accelerator: 'Accelerator',
  other: 'Other',
}

export const FUNDER_TYPE_LABELS: Record<FunderType, string> = {
  private_foundation: 'Private Foundation',
  community_foundation: 'Community Foundation',
  corporate: 'Corporate',
  government_federal: 'Federal Government',
  government_state: 'State Government',
  government_local: 'Local Government',
  individual_donor: 'Individual Donor',
  impact_investor: 'Impact Investor',
  international_org: 'International Organization',
  other: 'Other',
}

export const COMPLEXITY_LABELS: Record<ApplicationComplexity, string> = {
  simple: 'Simple',
  moderate: 'Moderate',
  complex: 'Complex',
  unknown: 'Unknown',
}

export const AMOUNT_PRESETS = [
  { label: 'Under $5K', min: 0, max: 500000 },
  { label: '$5K - $25K', min: 500000, max: 2500000 },
  { label: '$25K - $100K', min: 2500000, max: 10000000 },
  { label: '$100K - $500K', min: 10000000, max: 50000000 },
  { label: '$500K - $1M', min: 50000000, max: 100000000 },
  { label: '$1M+', min: 100000000, max: null },
]

export const ORG_TYPE_OPTIONS = [
  { value: '501c3', label: '501(c)(3) Nonprofit' },
  { value: 'fiscal_sponsor', label: 'Fiscal Sponsorship OK' },
  { value: 'social_enterprise', label: 'Social Enterprise' },
  { value: 'for_profit', label: 'For-Profit Eligible' },
  { value: 'individual', label: 'Individuals' },
  { value: 'government', label: 'Government Entities' },
  { value: 'tribal', label: 'Tribal Organizations' },
]

export const POPULATION_OPTIONS = [
  { value: 'youth', label: 'Youth & Children' },
  { value: 'seniors', label: 'Seniors & Aging' },
  { value: 'women', label: 'Women & Girls' },
  { value: 'lgbtq', label: 'LGBTQ+' },
  { value: 'bipoc', label: 'BIPOC Communities' },
  { value: 'indigenous', label: 'Indigenous Peoples' },
  { value: 'immigrants', label: 'Immigrants & Refugees' },
  { value: 'veterans', label: 'Veterans & Military Families' },
  { value: 'disabilities', label: 'People with Disabilities' },
  { value: 'low_income', label: 'Low-Income Communities' },
  { value: 'rural', label: 'Rural Communities' },
  { value: 'homeless', label: 'Unhoused / Homeless' },
  { value: 'formerly_incarcerated', label: 'Formerly Incarcerated' },
  { value: 'general', label: 'General Population' },
]

export const FOCUS_AREAS = [
  { slug: 'education', name: 'Education & Learning', icon: 'GraduationCap' },
  { slug: 'health', name: 'Health & Wellness', icon: 'Heart' },
  { slug: 'environment', name: 'Environment & Climate', icon: 'Leaf' },
  { slug: 'arts-culture', name: 'Arts & Culture', icon: 'Palette' },
  { slug: 'economic-development', name: 'Economic Development', icon: 'TrendingUp' },
  { slug: 'social-justice', name: 'Social Justice & Equity', icon: 'Scale' },
  { slug: 'youth-development', name: 'Youth Development', icon: 'Users' },
  { slug: 'housing', name: 'Housing & Homelessness', icon: 'Home' },
  { slug: 'food-agriculture', name: 'Food & Agriculture', icon: 'Wheat' },
  { slug: 'technology', name: 'Technology & Innovation', icon: 'Cpu' },
  { slug: 'civic-engagement', name: 'Civic Engagement', icon: 'Vote' },
  { slug: 'international', name: 'International Development', icon: 'Globe' },
  { slug: 'disability', name: 'Disability Rights', icon: 'Accessibility' },
  { slug: 'mental-health', name: 'Mental Health', icon: 'Brain' },
  { slug: 'workforce', name: 'Workforce Development', icon: 'Briefcase' },
  { slug: 'animal-welfare', name: 'Animal Welfare', icon: 'PawPrint' },
  { slug: 'veterans', name: 'Veterans Services', icon: 'Shield' },
  { slug: 'media-journalism', name: 'Media & Journalism', icon: 'Newspaper' },
  { slug: 'science-research', name: 'Science & Research', icon: 'Microscope' },
  { slug: 'community-development', name: 'Community Development', icon: 'Building' },
]

export const SORT_OPTIONS = [
  { value: 'relevance', label: 'Most Relevant' },
  { value: 'deadline_asc', label: 'Deadline (Soonest)' },
  { value: 'deadline_desc', label: 'Deadline (Latest)' },
  { value: 'amount_desc', label: 'Amount (Highest)' },
  { value: 'amount_asc', label: 'Amount (Lowest)' },
  { value: 'newest', label: 'Newest First' },
]
