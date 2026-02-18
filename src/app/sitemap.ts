import type { MetadataRoute } from 'next'
import { getAllOpportunities, getAllFunderSlugs } from '@/lib/data'
import { FOCUS_AREAS, OPPORTUNITY_TYPE_LABELS } from '@/lib/constants'

const BASE_URL = 'https://grantlink.org'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [opportunities, funderSlugs] = await Promise.all([
    getAllOpportunities(),
    getAllFunderSlugs(),
  ])

  const opportunityPages = opportunities.map((opp) => ({
    url: `${BASE_URL}/opportunity/${opp.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
  }))

  const funderPages = funderSlugs.map((slug) => ({
    url: `${BASE_URL}/funder/${slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const focusAreaPages = FOCUS_AREAS.map((area) => ({
    url: `${BASE_URL}/grants-for/${area.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  const typePages = Object.keys(OPPORTUNITY_TYPE_LABELS).map((type) => ({
    url: `${BASE_URL}/grants-by-type/${type}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.7,
  }))

  return [
    {
      url: BASE_URL,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${BASE_URL}/search`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${BASE_URL}/about`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${BASE_URL}/submit`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.6,
    },
    ...opportunityPages,
    ...funderPages,
    ...focusAreaPages,
    ...typePages,
  ]
}
