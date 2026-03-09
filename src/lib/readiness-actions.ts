/**
 * Readiness Action Mappings
 *
 * Connects each readiness quiz question to actionable resources —
 * both in-app GrantLink features and curated external guides.
 *
 * Used by the Results component to render the "Your Action Plan" section.
 */

export interface ReadinessAction {
  questionId: string
  category: string
  /** Link to a GrantLink feature the user can do right now */
  primaryAction: {
    label: string
    href: string
    description: string
    estimatedMinutes: number
  } | null
  /** Link to a curated external resource */
  externalResource: {
    label: string
    href: string
    source: string
  } | null
  /** 1-5: how much fixing this area improves overall grant readiness */
  impactWeight: number
  /** Can this be addressed today inside GrantLink? */
  quickWin: boolean
}

export const READINESS_ACTIONS: ReadinessAction[] = [
  {
    questionId: 'tax-status',
    category: 'Legal Foundation',
    primaryAction: null,
    externalResource: {
      label: 'Fiscal Sponsorship Guide',
      href: 'https://www.councilofnonprofits.org/running-nonprofit/administration-and-financial-management/fiscal-sponsorship-nonprofits',
      source: 'National Council of Nonprofits',
    },
    impactWeight: 5,
    quickWin: false,
  },
  {
    questionId: 'mission',
    category: 'Organizational Clarity',
    primaryAction: {
      label: 'Define Your Mission',
      href: '/organization',
      description: 'Add your mission statement and focus areas to your GrantLink profile.',
      estimatedMinutes: 10,
    },
    externalResource: {
      label: 'Theory of Change Toolkit',
      href: 'https://learning.candid.org/resources/knowledge-base/theory-of-change/',
      source: 'Candid',
    },
    impactWeight: 5,
    quickWin: true,
  },
  {
    questionId: 'financials',
    category: 'Financial Health',
    primaryAction: null,
    externalResource: {
      label: 'Nonprofit Accounting Basics',
      href: 'https://www.councilofnonprofits.org/running-nonprofit/administration-and-financial-management/nonprofit-accounting-basics',
      source: 'National Council of Nonprofits',
    },
    impactWeight: 4,
    quickWin: false,
  },
  {
    questionId: 'board',
    category: 'Governance',
    primaryAction: null,
    externalResource: {
      label: 'Board Development Guide',
      href: 'https://boardsource.org/resources/building-board/',
      source: 'BoardSource',
    },
    impactWeight: 3,
    quickWin: false,
  },
  {
    questionId: 'impact',
    category: 'Impact Measurement',
    primaryAction: {
      label: 'Set Up Impact Tracking',
      href: '/impact/setup',
      description: 'Choose your issue area and start tracking metrics in minutes.',
      estimatedMinutes: 10,
    },
    externalResource: {
      label: 'Measuring Outcomes Guide',
      href: 'https://learning.candid.org/resources/knowledge-base/measuring-and-reporting-results/',
      source: 'Candid',
    },
    impactWeight: 5,
    quickWin: true,
  },
  {
    questionId: 'programs',
    category: 'Program Design',
    primaryAction: {
      label: 'Document Your Programs',
      href: '/organization',
      description: 'Describe your core programs in your organization profile.',
      estimatedMinutes: 15,
    },
    externalResource: {
      label: 'Logic Model Builder',
      href: 'https://www.innonet.org/resources/logic-model-workbook/',
      source: 'Innovation Network',
    },
    impactWeight: 4,
    quickWin: true,
  },
  {
    questionId: 'budget',
    category: 'Financial Planning',
    primaryAction: null,
    externalResource: {
      label: 'Nonprofit Budget Template',
      href: 'https://www.councilofnonprofits.org/running-nonprofit/administration-and-financial-management/budgeting-nonprofits',
      source: 'National Council of Nonprofits',
    },
    impactWeight: 4,
    quickWin: false,
  },
  {
    questionId: 'experience',
    category: 'Grant Experience',
    primaryAction: {
      label: 'Find First-Time Grants',
      href: '/search',
      description: 'Search for grants designed for newer organizations.',
      estimatedMinutes: 5,
    },
    externalResource: {
      label: 'Grant Writing 101',
      href: 'https://www.councilofnonprofits.org/running-nonprofit/fundraising-and-resource-development/securing-grants',
      source: 'National Council of Nonprofits',
    },
    impactWeight: 3,
    quickWin: true,
  },
  {
    questionId: 'capacity',
    category: 'Team Capacity',
    primaryAction: null,
    externalResource: {
      label: 'Building Grant Capacity',
      href: 'https://learning.candid.org/resources/knowledge-base/strengthening-nonprofit-capacity/',
      source: 'Candid',
    },
    impactWeight: 3,
    quickWin: false,
  },
  {
    questionId: 'storytelling',
    category: 'Communications',
    primaryAction: {
      label: 'Create an Impact Report',
      href: '/impact/report',
      description: 'Generate a funder-ready report from your impact data.',
      estimatedMinutes: 15,
    },
    externalResource: {
      label: 'Storytelling for Nonprofits',
      href: 'https://learning.candid.org/resources/knowledge-base/communicating-with-funders/',
      source: 'Candid',
    },
    impactWeight: 4,
    quickWin: true,
  },
  {
    questionId: 'public-presence',
    category: 'Strategic Positioning',
    primaryAction: {
      label: 'Update Your Profile',
      href: '/organization',
      description: 'Complete your organization profile to strengthen your public presence.',
      estimatedMinutes: 10,
    },
    externalResource: {
      label: 'Nonprofit Web Presence Guide',
      href: 'https://www.councilofnonprofits.org/running-nonprofit/communications/communications-nonprofit-organizations',
      source: 'National Council of Nonprofits',
    },
    impactWeight: 3,
    quickWin: true,
  },
  {
    questionId: 'collaboration',
    category: 'Collaborative Readiness',
    primaryAction: {
      label: 'Find Partner Organizations',
      href: '/partners',
      description: 'Discover aligned organizations and collaborative funding opportunities.',
      estimatedMinutes: 5,
    },
    externalResource: {
      label: 'Collaborative Funding Guide',
      href: 'https://www.councilofnonprofits.org/running-nonprofit/fundraising-and-resource-development/collaboration-among-nonprofits',
      source: 'National Council of Nonprofits',
    },
    impactWeight: 3,
    quickWin: true,
  },
]

/** Look up the action mapping for a given question ID. */
export function getActionForQuestion(questionId: string): ReadinessAction | undefined {
  return READINESS_ACTIONS.find((a) => a.questionId === questionId)
}
