import type { MetadataRoute } from 'next'
import { getAllOpportunities } from '@/lib/data'

const BASE_URL = 'https://grantlink.org'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const opportunities = await getAllOpportunities()

  const opportunityPages = opportunities.map((opp) => ({
    url: `${BASE_URL}/opportunity/${opp.slug}`,
    lastModified: new Date(),
    changeFrequency: 'weekly' as const,
    priority: 0.8,
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
  ]
}
