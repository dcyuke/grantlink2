import { HeroSection } from '@/components/home/hero-section'
import { StatsBar } from '@/components/home/stats-bar'
import { FeaturedGrid } from '@/components/home/featured-grid'
import { ClosingSoonSection } from '@/components/home/closing-soon'
import { RecentlyAddedSection } from '@/components/home/recently-added'
import { CategoryCards } from '@/components/home/category-cards'
import { FunderLogoBar } from '@/components/home/funder-logo-bar'
import { HowItWorks } from '@/components/home/how-it-works'
import { LastUpdated } from '@/components/home/last-updated'
import { EmailSignup } from '@/components/home/email-signup'
import { getHomepageData } from '@/lib/data'
import { FOCUS_AREAS } from '@/lib/constants'

export default async function HomePage() {
  const data = await getHomepageData()

  return (
    <>
      <HeroSection deadlinesThisMonth={data.deadlinesThisMonth} />
      <StatsBar
        opportunityCount={data.opportunityCount}
        funderCount={data.funderCount}
        totalFunding={data.totalFundingDisplay}
        deadlinesThisMonth={data.deadlinesThisMonth}
      />
      <FeaturedGrid opportunities={data.featured} />
      <ClosingSoonSection opportunities={data.closingSoon} />
      <RecentlyAddedSection opportunities={data.recentlyAdded} />
      <CategoryCards categories={FOCUS_AREAS} />
      <FunderLogoBar funders={data.topFunders} />
      <HowItWorks />
      <LastUpdated lastUpdated={data.lastUpdated} />
      <EmailSignup />
    </>
  )
}
