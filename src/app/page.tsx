import { HeroSection } from '@/components/home/hero-section'
import { StatsBar } from '@/components/home/stats-bar'
import { FeaturedGrid } from '@/components/home/featured-grid'
import { CategoryCards } from '@/components/home/category-cards'
import { HowItWorks } from '@/components/home/how-it-works'
import { EmailSignup } from '@/components/home/email-signup'
import { getFeaturedOpportunities, getOpportunityStats } from '@/lib/data'
import { FOCUS_AREAS } from '@/lib/constants'

export default async function HomePage() {
  const [featured, stats] = await Promise.all([
    getFeaturedOpportunities(),
    getOpportunityStats(),
  ])

  return (
    <>
      <HeroSection />
      <StatsBar
        opportunityCount={stats.opportunityCount}
        funderCount={stats.funderCount}
        focusAreaCount={stats.focusAreaCount}
      />
      <FeaturedGrid opportunities={featured} />
      <CategoryCards categories={FOCUS_AREAS} />
      <HowItWorks />
      <EmailSignup />
    </>
  )
}
