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
      {/* Page-level gradient blobs for 3D depth throughout */}
      <div aria-hidden className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute top-[20%] -left-[10%] h-[700px] w-[700px] rounded-full bg-[oklch(0.88_0.06_145_/_0.15)] blur-[140px] will-change-transform animate-blob-drift" />
        <div className="absolute top-[50%] -right-[10%] h-[600px] w-[600px] rounded-full bg-[oklch(0.90_0.05_160_/_0.12)] blur-[140px] will-change-transform animate-blob-drift animation-delay-200" />
        <div className="absolute top-[75%] left-[20%] h-[500px] w-[500px] rounded-full bg-[oklch(0.86_0.04_130_/_0.10)] blur-[140px] will-change-transform animate-blob-drift animation-delay-400" />
      </div>
      <div className="relative z-[1]">
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
    </div>
  )
}
