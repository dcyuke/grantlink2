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
            Track your nonprofit&apos;s outputs, outcomes, and impact with frameworks
            designed for your issue area. Generate polished reports for donors,
            board members, and stakeholders.
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

      {/* M&E Plan Builder CTA */}
      <div className="container mx-auto px-4 pb-16">
        <div className="mx-auto max-w-2xl rounded-2xl border border-primary/20 bg-primary/5 p-8 text-center">
          <ClipboardList className="mx-auto mb-3 h-8 w-8 text-primary" />
          <h2 className="mb-2 font-serif text-xl font-semibold text-foreground">
            Evaluation Plan Builder
          </h2>
          <p className="mb-4 text-sm leading-relaxed text-muted-foreground">
            Not sure where to start? Our guided questionnaire walks you through
            building a simple monitoring &amp; evaluation plan — no jargon required.
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
                title: 'Choose Your Metrics',
                desc: 'Select your issue area and pick from curated metrics — outputs, outcomes, and impact indicators tailored to your work.',
              },
              {
                icon: TrendingUp,
                title: 'Track Your Progress',
                desc: 'Enter data monthly, quarterly, or annually. See trends over time with clear visual dashboards.',
              },
              {
                icon: FileText,
                title: 'Generate Reports',
                desc: 'Export polished impact reports, donor updates, or board presentations with a single click.',
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
                title: 'Expert-Informed Frameworks',
                desc: 'Metrics curated for 20 issue areas — the questions funders actually want answered.',
              },
              {
                icon: Users,
                title: 'Stakeholder-Ready Reports',
                desc: 'Professional templates for donor updates, board presentations, and grant applications.',
              },
              {
                icon: BarChart3,
                title: 'Visual Dashboards',
                desc: 'See your progress at a glance with clear charts and trend indicators.',
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
              Ready to Measure Your Impact?
            </h2>
            <p className="mb-6 text-muted-foreground">
              It takes less than 2 minutes to set up. Choose your issue area, select
              your metrics, and start tracking.
            </p>
            <Button asChild size="lg" className="gap-2 rounded-full px-6">
              <Link href="/impact/setup">
                Start Now — It&apos;s Free
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
