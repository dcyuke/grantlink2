'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  GraduationCap,
  Heart,
  Leaf,
  Palette,
  TrendingUp,
  Scale,
  Users,
  Home,
  Wheat,
  Cpu,
  Vote,
  Globe,
  Accessibility,
  Brain,
  Briefcase,
  PawPrint,
  Shield,
  Newspaper,
  Microscope,
  Building,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  METRIC_FRAMEWORKS,
  CATEGORY_LABELS,
  CATEGORY_DESCRIPTIONS,
  type MetricCategory,
  type MetricDefinition,
} from '@/lib/impact-metrics'
import { saveImpactConfig, type ImpactConfig } from '@/lib/impact-storage'

// Map slug → lucide icon
const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  'education': GraduationCap,
  'health': Heart,
  'environment': Leaf,
  'arts-culture': Palette,
  'economic-development': TrendingUp,
  'social-justice': Scale,
  'youth-development': Users,
  'housing': Home,
  'food-agriculture': Wheat,
  'technology': Cpu,
  'civic-engagement': Vote,
  'international': Globe,
  'disability': Accessibility,
  'mental-health': Brain,
  'workforce': Briefcase,
  'animal-welfare': PawPrint,
  'veterans': Shield,
  'media-journalism': Newspaper,
  'science-research': Microscope,
  'community-development': Building,
}

export function ImpactSetup() {
  const router = useRouter()
  const [step, setStep] = useState<1 | 2>(1)
  const [selectedSlug, setSelectedSlug] = useState<string | null>(null)
  const [selectedMetrics, setSelectedMetrics] = useState<Set<string>>(new Set())

  const framework = METRIC_FRAMEWORKS.find((f) => f.slug === selectedSlug)

  // ── Step 1: Choose issue area ────────────────────────────────
  if (step === 1) {
    return (
      <div>
        {/* Header */}
        <div className="mb-8">
          <Link
            href="/impact"
            className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3.5 w-3.5" />
            Back
          </Link>
          <h1 className="mb-2 font-serif text-3xl font-bold tracking-tight text-foreground">
            Choose Your Issue Area
          </h1>
          <p className="text-muted-foreground">
            Select the area that best describes your organization&apos;s work.
            We&apos;ll suggest the right metrics to track.
          </p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
            <span>Step 1 of 2</span>
            <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
              Issue Area
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-1/2 rounded-full bg-primary transition-all duration-500" />
          </div>
        </div>

        {/* Grid */}
        <div className="grid gap-3 sm:grid-cols-2">
          {METRIC_FRAMEWORKS.map((fw) => {
            const Icon = ICON_MAP[fw.slug] ?? Building
            const isSelected = selectedSlug === fw.slug
            return (
              <button
                key={fw.slug}
                onClick={() => {
                  setSelectedSlug(fw.slug)
                  setSelectedMetrics(new Set())
                }}
                className={`flex items-center gap-3 rounded-lg border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border/60 bg-card hover:border-primary/30 hover:shadow-sm'
                }`}
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full ${
                    isSelected
                      ? 'bg-primary/10 text-primary'
                      : 'bg-muted/60 text-muted-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                </div>
                <div>
                  <p
                    className={`text-sm font-medium ${
                      isSelected ? 'text-foreground' : 'text-muted-foreground'
                    }`}
                  >
                    {fw.name}
                  </p>
                  <p className="text-xs text-muted-foreground/70">
                    {fw.metrics.length} metrics
                  </p>
                </div>
                {isSelected && (
                  <CheckCircle2 className="ml-auto h-4 w-4 shrink-0 text-primary" />
                )}
              </button>
            )
          })}
        </div>

        {/* Next */}
        <div className="mt-8 flex justify-end">
          <Button
            size="lg"
            className="gap-2"
            disabled={!selectedSlug}
            onClick={() => {
              if (selectedSlug && framework) {
                // Pre-select all metrics by default
                setSelectedMetrics(new Set(framework.metrics.map((m) => m.id)))
                setStep(2)
              }
            }}
          >
            Next: Choose Metrics
            <ArrowRight className="h-4 w-4" />
          </Button>
        </div>
      </div>
    )
  }

  // ── Step 2: Choose metrics ───────────────────────────────────
  if (!framework) return null

  const grouped: Record<MetricCategory, MetricDefinition[]> = {
    output: [],
    outcome: [],
    impact: [],
  }
  for (const m of framework.metrics) {
    grouped[m.category].push(m)
  }

  const toggleMetric = (id: string) => {
    setSelectedMetrics((prev) => {
      const next = new Set(prev)
      if (next.has(id)) {
        next.delete(id)
      } else {
        next.add(id)
      }
      return next
    })
  }

  const selectAll = () => {
    setSelectedMetrics(new Set(framework.metrics.map((m) => m.id)))
  }

  const clearAll = () => {
    setSelectedMetrics(new Set())
  }

  const handleFinish = () => {
    if (!selectedSlug || selectedMetrics.size === 0) return
    const config: ImpactConfig = {
      issueAreaSlug: selectedSlug,
      issueAreaName: framework.name,
      selectedMetricIds: Array.from(selectedMetrics),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
    saveImpactConfig(config)
    router.push('/impact/dashboard')
  }

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <button
          onClick={() => setStep(1)}
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Change issue area
        </button>
        <h1 className="mb-2 font-serif text-3xl font-bold tracking-tight text-foreground">
          Select Your Metrics
        </h1>
        <p className="text-muted-foreground">
          Choose which metrics to track for{' '}
          <span className="font-medium text-foreground">{framework.name}</span>.
          You can always change these later.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Step 2 of 2</span>
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium">
            Metrics
          </span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div className="h-full w-full rounded-full bg-primary transition-all duration-500" />
        </div>
      </div>

      {/* Bulk actions */}
      <div className="mb-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          <span className="font-medium text-foreground">{selectedMetrics.size}</span>{' '}
          of {framework.metrics.length} selected
        </p>
        <div className="flex gap-2">
          <button
            onClick={selectAll}
            className="text-xs font-medium text-primary hover:text-primary/80"
          >
            Select all
          </button>
          <span className="text-xs text-muted-foreground/40">|</span>
          <button
            onClick={clearAll}
            className="text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Metric categories */}
      <div className="space-y-8">
        {(['output', 'outcome', 'impact'] as MetricCategory[]).map((cat) => {
          const metrics = grouped[cat]
          if (metrics.length === 0) return null
          return (
            <div key={cat}>
              <div className="mb-3">
                <h3 className="font-serif text-lg font-semibold text-foreground">
                  {CATEGORY_LABELS[cat]}
                </h3>
                <p className="text-xs text-muted-foreground">
                  {CATEGORY_DESCRIPTIONS[cat]}
                </p>
              </div>
              <div className="space-y-2">
                {metrics.map((m) => {
                  const checked = selectedMetrics.has(m.id)
                  return (
                    <button
                      key={m.id}
                      onClick={() => toggleMetric(m.id)}
                      className={`flex w-full items-start gap-3 rounded-lg border p-4 text-left transition-all ${
                        checked
                          ? 'border-primary/40 bg-primary/5'
                          : 'border-border/60 bg-card hover:border-primary/20'
                      }`}
                    >
                      <div
                        className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded border transition-colors ${
                          checked
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-border/80 bg-background'
                        }`}
                      >
                        {checked && (
                          <svg
                            className="h-3 w-3"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                            strokeWidth={3}
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              d="M5 13l4 4L19 7"
                            />
                          </svg>
                        )}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-foreground">
                          {m.label}
                        </p>
                        <p className="mt-0.5 text-xs leading-relaxed text-muted-foreground">
                          {m.description}
                        </p>
                      </div>
                      <span className="mt-0.5 shrink-0 rounded-full bg-muted/60 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                        {m.unit}
                      </span>
                    </button>
                  )
                })}
              </div>
            </div>
          )
        })}
      </div>

      {/* Finish */}
      <div className="mt-10 flex items-center justify-between border-t border-border/30 pt-6">
        <button
          onClick={() => setStep(1)}
          className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        <Button
          size="lg"
          className="gap-2"
          disabled={selectedMetrics.size === 0}
          onClick={handleFinish}
        >
          Start Tracking
          <ArrowRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
