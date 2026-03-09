import { PageTint } from '@/components/layout/page-tint'
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
import { GrantMotivation } from '@/components/home/grant-motivation'
import { ImpactCTA } from '@/components/home/impact-cta'
import { AnimateOnScroll } from '@/components/ui/animate-on-scroll'
import { getHomepageData } from '@/lib/data'
import { FOCUS_AREAS } from '@/lib/constants'

export default async function HomePage() {
  const data = await getHomepageData()

  return (
    <div className="relative">
      <PageTint color="oklch(0.75 0.15 145 / 0.25)" />
      <HeroSection deadlinesThisMonth={data.deadlinesThisMonth} />
      <AnimateOnScroll>
        <StatsBar
          opportunityCount={data.opportunityCount}
          funderCount={data.funderCount}
          totalFunding={data.totalFundingDisplay}
          deadlinesThisMonth={data.deadlinesThisMonth}
        />
      </AnimateOnScroll>
      <AnimateOnScroll delay={50}>
        <FeaturedGrid opportunities={data.featured} />
      </AnimateOnScroll>
      <AnimateOnScroll delay={50}>
        <ClosingSoonSection opportunities={data.closingSoon} />
      </AnimateOnScroll>
      <AnimateOnScroll delay={50}>
        <RecentlyAddedSection opportunities={data.recentlyAdded} />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <CategoryCards categories={FOCUS_AREAS} />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <FunderLogoBar funders={data.topFunders} />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <HowItWorks />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <LastUpdated lastUpdated={data.lastUpdated} />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <ImpactCTA />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <GrantMotivation />
      </AnimateOnScroll>
      <AnimateOnScroll>
        <EmailSignup />
      </AnimateOnScroll>
    </div>
  )
}
