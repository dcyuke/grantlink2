'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import {
  BarChart3,
  Target,
  FileText,
  ArrowRight,
  ClipboardList,
  Lightbulb,
  TrendingUp,
  Users,
  Upload,
  Database,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getImpactConfig, IMPACT_CONFIG_EVENT } from '@/lib/impact-storage'
import { getMEPlan, ME_PLAN_EVENT } from '@/lib/me-plan-storage'

export function ImpactLanding() {
  const [hasConfig, setHasConfig] = useState(false)
  const [hasMEPlan, setHasMEPlan] = useState(false)

  useEffect(() => {
    const checkConfig = () => setHasConfig(!!getImpactConfig())
    const checkPlan = () => setHasMEPlan(!!getMEPlan())
    checkConfig()
    checkPlan()
    window.addEventListener(IMPACT_CONFIG_EVENT, checkConfig)
    window.addEventListener(ME_PLAN_EVENT, checkPlan)
    return () => {
      window.removeEventListener(IMPACT_CONFIG_EVENT, checkConfig)
      window.removeEventListener(ME_PLAN_EVENT, checkPlan)
    }
  }, [])

  return (
    <div>
      {/* Hero */}
      <div className="container mx-auto px-4 pb-16 pt-16 md:pt-24">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mb-4 text-sm font-medium tracking-widest uppercase text-muted-foreground/60">
            Impact Measurement
          </p>
          <h1 className="mb-6 font-serif text-4xl font-bold tracking-tight text-foreground md:text-5xl lg:text-6xl">
            Measure What Matters
          </h1>
          <p className="mx-auto mb-10 max-w-2xl text-lg leading-relaxed text-muted-foreground">
            Funders don&apos;t fund activities — they fund results. Start collecting
            the outcome data that wins grants and builds trust, with frameworks
            designed for small and mid-sized nonprofits.
          </p>
          <div className="flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
            {hasConfig ? (
              <>
                <Button asChild size="lg" className="gap-2 rounded-full px-6">
                  <Link href="/impact/dashboard">
                    Go to Dashboard
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="gap-2 rounded-full px-6">
                  <Link href="/impact/report">
                    View Reports
                    <FileText className="h-4 w-4" />
                  </Link>
                </Button>
              </>
            ) : (
              <Button asChild size="lg" className="gap-2 rounded-full px-6">
                <Link href="/impact/setup">
                  Get Started
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Data Import & View */}
      <div className="container mx-auto px-4 pb-12">
        <div className="mx-auto grid max-w-2xl gap-4 sm:grid-cols-2">
          <Link
            href="/impact/import"
            className="flex gap-4 rounded-2xl border border-border/40 p-6 transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <Upload className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h3 className="mb-1 font-medium text-foreground">Import Data</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Upload CSV, Excel, or paste data — we&apos;ll organize it automatically.
              </p>
            </div>
          </Link>
          <Link
            href="/impact/data"
            className="flex gap-4 rounded-2xl border border-border/40 p-6 transition-colors hover:border-primary/30 hover:bg-primary/5"
          >
            <Database className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
            <div>
              <h3 className="mb-1 font-medium text-foreground">View Imported Data</h3>
              <p className="text-sm leading-relaxed text-muted-foreground">
                Interactive charts and data tables from your imported datasets.
              </p>
            </div>
          </Link>
        </div>
      </div>

      {/* M&E Plan Builder CTA */}
      <div className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <ClipboardList className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h2 className="mb-2 font-serif text-xl font-semibold text-foreground">
            Evaluation Plan Builder
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            Not sure where to start? Our guided questionnaire walks small nonprofit
            teams through building a simple monitoring &amp; evaluation plan — no jargon required.
          </p>
          <Button asChild variant="outline" className="gap-2 rounded-full">
            <Link href="/impact/evaluation">
              {hasMEPlan ? 'View Your M&E Plan' : 'Build Your Plan'}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </Button>
        </div>
      </div>

      {/* How it works */}
      <div className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-4xl">
          <p className="mb-3 text-center text-sm font-medium tracking-widest uppercase text-muted-foreground/60">
            How-to
          </p>
          <h2 className="mb-12 text-center font-serif text-2xl font-semibold text-foreground md:text-3xl">
            How It Works
          </h2>
          <div className="grid gap-8 md:grid-cols-3">
            {[
              {
                icon: Target,
                title: 'Know What Data to Collect',
                desc: 'Expert-curated frameworks for 20 issue areas tell you exactly which outputs, outcomes, and impact indicators to track — the same metrics funders look for.',
              },
              {
                icon: TrendingUp,
                title: 'Build Your Evidence Base',
                desc: 'Enter data monthly, quarterly, or annually. Over time, you build the evidence base that turns grant applications from guesses into proof.',
              },
              {
                icon: FileText,
                title: 'Show Funders Results',
                desc: 'Turn your data into polished impact reports, donor updates, and board presentations that demonstrate real outcomes.',
              },
            ].map((step, i) => (
              <div key={i} className="border-t border-border pt-5">
                <step.icon className="mb-3 h-5 w-5 text-foreground/60" />
                <h3 className="mb-2 font-medium text-foreground">
                  {step.title}
                </h3>
                <p className="text-sm leading-relaxed text-muted-foreground">
                  {step.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Benefits */}
      <div className="container mx-auto px-4 pb-20">
        <div className="mx-auto max-w-3xl border-t border-border/30 pt-16">
          <h2 className="mb-10 text-center font-serif text-2xl font-semibold text-foreground">
            Built for Small &amp; Mid-Size Nonprofits
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            {[
              {
                icon: Lightbulb,
                title: 'Collect the Right Data',
                desc: 'Stop guessing what funders want. Our frameworks guide you to collect exactly the outcome data that strengthens grant applications.',
              },
              {
                icon: Users,
                title: 'Turn Data into Trust',
                desc: 'Every data point you collect becomes a story of impact. Generate donor updates, board decks, and grant reports that build funder confidence.',
              },
              {
                icon: BarChart3,
                title: 'See Growth Over Time',
                desc: 'Track trends across reporting periods. Consistent data collection shows funders you take measurement seriously — and that drives repeat funding.',
              },
            ].map((benefit, i) => (
              <div
                key={i}
                className="flex gap-4 rounded-2xl border border-border/40 p-6"
              >
                <benefit.icon className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
                <div>
                  <h3 className="mb-1 font-medium text-foreground">
                    {benefit.title}
                  </h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {benefit.desc}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA */}
      {!hasConfig && (
        <div className="container mx-auto px-4 pb-20">
          <div className="mx-auto max-w-2xl border-t border-border/30 pt-16 text-center">
            <h2 className="mb-3 font-serif text-2xl font-semibold text-foreground">
              Start Building Your Evidence Base
            </h2>
            <p className="mb-6 text-muted-foreground">
              The sooner you start collecting data, the stronger your next grant application
              will be. Set up takes less than 2 minutes — choose your issue area, select your
              metrics, and start tracking today.
            </p>
            <Button asChild size="lg" className="gap-2 rounded-full px-6">
              <Link href="/impact/setup">
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
