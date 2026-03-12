'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Search,
  TrendingUp,
  TrendingDown,
  Zap,
  Clock,
  ExternalLink,
  ClipboardCheck,
} from 'lucide-react'
import { saveReadinessResult, getPreviousResult } from '@/lib/readiness-storage'
import { READINESS_ACTIONS, type ReadinessAction } from '@/lib/readiness-actions'
import type { ReadinessLevel } from '@/lib/readiness-storage'

// ── Question Data ────────────────────────────────────────────────────

interface Question {
  id: string
  category: string
  question: string
  options: { label: string; score: number; tip: string }[]
}

const QUESTIONS: Question[] = [
  {
    id: 'tax-status',
    category: 'Legal Foundation',
    question: 'Does your organization have 501(c)(3) status or a fiscal sponsor?',
    options: [
      { label: 'Yes, we have 501(c)(3) status', score: 3, tip: '' },
      { label: 'We have a fiscal sponsor', score: 2, tip: 'A fiscal sponsor works for many grants, but some funders require direct 501(c)(3) status.' },
      { label: 'We\'re in the process of applying', score: 1, tip: 'Many funders require tax-exempt status. Consider a fiscal sponsor while your application is pending.' },
      { label: 'No, not yet', score: 0, tip: 'Most grant funders require 501(c)(3) status. Look into fiscal sponsorship as a stepping stone.' },
    ],
  },
  {
    id: 'mission',
    category: 'Organizational Clarity',
    question: 'How clearly can your team articulate your mission and theory of change?',
    options: [
      { label: 'We have a documented mission, vision, and theory of change', score: 3, tip: '' },
      { label: 'We have a clear mission statement but no formal theory of change', score: 2, tip: 'A theory of change helps funders understand how your activities lead to impact. Consider developing one.' },
      { label: 'We know what we do but haven\'t formalized it', score: 1, tip: 'Funders look for organizations with a clear, documented mission. Take time to write it down.' },
      { label: 'We\'re still figuring out our direction', score: 0, tip: 'Defining your mission is the first step. Funders want to know exactly what problem you solve and for whom.' },
    ],
  },
  {
    id: 'financials',
    category: 'Financial Health',
    question: 'What is the state of your financial record-keeping?',
    options: [
      { label: 'We have audited or reviewed financial statements', score: 3, tip: '' },
      { label: 'We maintain organized bookkeeping with a budget', score: 2, tip: 'Consider getting a financial review as you pursue larger grants. Many funders require audited statements above $500K.' },
      { label: 'We have basic financial records', score: 1, tip: 'Strong financials build funder confidence. Invest in bookkeeping software or a part-time bookkeeper.' },
      { label: 'Our finances are informal or disorganized', score: 0, tip: 'Organized finances are essential for grants. Start with basic bookkeeping and create an annual budget.' },
    ],
  },
  {
    id: 'board',
    category: 'Governance',
    question: 'Do you have an active board of directors?',
    options: [
      { label: 'Yes, with regular meetings and diverse membership', score: 3, tip: '' },
      { label: 'Yes, but it could be more active or diverse', score: 2, tip: 'Many funders look at board composition. Consider recruiting members with different skills and backgrounds.' },
      { label: 'We have a board on paper but it\'s not very active', score: 1, tip: 'An engaged board strengthens your grant applications. Set regular meeting schedules and define board roles.' },
      { label: 'No formal board', score: 0, tip: 'Most funders require a functioning board. Start by recruiting 3-5 committed community members.' },
    ],
  },
  {
    id: 'impact',
    category: 'Impact Measurement',
    question: 'How do you track and measure your impact?',
    options: [
      { label: 'We have formal metrics, data collection, and outcome reports', score: 3, tip: '' },
      { label: 'We track outputs (people served, events held, etc.)', score: 2, tip: 'Try adding outcome metrics — not just what you did, but what changed as a result of your work.' },
      { label: 'We have anecdotal evidence and stories', score: 1, tip: 'Stories are powerful, but funders also want numbers. Start tracking basic metrics like people served and results achieved.' },
      { label: 'We don\'t formally track impact yet', score: 0, tip: 'Impact data is critical for grant applications. Start simple: what do you do, for whom, and what changes?' },
    ],
  },
  {
    id: 'programs',
    category: 'Program Design',
    question: 'How well-defined are your programs or services?',
    options: [
      { label: 'Programs are documented with clear goals, activities, and timelines', score: 3, tip: '' },
      { label: 'We have established programs but they\'re not fully documented', score: 2, tip: 'Documenting your program design makes grant writing much easier. Create a one-pager for each program.' },
      { label: 'We offer services but they shift based on need', score: 1, tip: 'Flexibility is good, but funders want to see structured programs. Define your core offerings.' },
      { label: 'We\'re still developing our programming', score: 0, tip: 'Design at least one core program with clear objectives before applying for program-specific grants.' },
    ],
  },
  {
    id: 'budget',
    category: 'Financial Planning',
    question: 'Do you have a program-level budget and organizational budget?',
    options: [
      { label: 'Yes, with both an org budget and program budgets', score: 3, tip: '' },
      { label: 'We have an organizational budget but not program-specific ones', score: 2, tip: 'Most grant applications require a program budget. Break out costs by program area.' },
      { label: 'We have a rough budget', score: 1, tip: 'A detailed budget shows funders you\'re financially responsible. Include revenue sources, expenses, and projections.' },
      { label: 'No formal budget', score: 0, tip: 'Create an annual budget before applying for grants. It\'s a requirement for virtually every application.' },
    ],
  },
  {
    id: 'experience',
    category: 'Grant Experience',
    question: 'What is your organization\'s experience with grants?',
    options: [
      { label: 'We\'ve successfully managed multiple grants', score: 3, tip: '' },
      { label: 'We\'ve received one or two grants before', score: 2, tip: 'Build on your experience. Keep good records of how you used past funding — funders love a track record.' },
      { label: 'We\'ve applied but haven\'t received a grant yet', score: 1, tip: 'Don\'t give up! Review feedback, strengthen your application, and look for smaller, first-time-friendly grants.' },
      { label: 'We\'ve never applied for a grant', score: 0, tip: 'Start with smaller grants ($1K-$10K) that are designed for newer organizations. Build your track record.' },
    ],
  },
  {
    id: 'capacity',
    category: 'Team Capacity',
    question: 'Who would manage the grant writing and reporting?',
    options: [
      { label: 'We have dedicated development/grant staff', score: 3, tip: '' },
      { label: 'A staff member can dedicate time to grants alongside other duties', score: 2, tip: 'Grant management takes significant time. Make sure there\'s dedicated capacity for writing, tracking, and reporting.' },
      { label: 'A volunteer or board member would handle it', score: 1, tip: 'Consider investing in part-time grant support. Consistent applications yield better results than sporadic efforts.' },
      { label: 'No one is assigned to this yet', score: 0, tip: 'Someone needs to own the grant process. Even 5-10 hours per week dedicated to grants can make a difference.' },
    ],
  },
  {
    id: 'storytelling',
    category: 'Communications',
    question: 'How strong is your organization\'s ability to tell its story?',
    options: [
      { label: 'We have compelling case studies, photos, and testimonials ready', score: 3, tip: '' },
      { label: 'We have good stories but they\'re not organized for grant use', score: 2, tip: 'Create a "grant assets" folder with your best success stories, photos, data points, and quotes.' },
      { label: 'We know our impact but struggle to communicate it', score: 1, tip: 'Practice your elevator pitch and write down 3-5 success stories. These are the backbone of any grant application.' },
      { label: 'We haven\'t focused on storytelling yet', score: 0, tip: 'Start collecting stories now. Ask your program participants for testimonials and take photos of your work.' },
    ],
  },
  {
    id: 'public-presence',
    category: 'Strategic Positioning',
    question: 'How intentional is your public presence (website, social media, annual report, 990)?',
    options: [
      { label: 'Our website, social, 990, and annual report consistently reflect our mission and impact', score: 3, tip: '' },
      { label: 'We have most pieces but they\'re not cohesive or regularly updated', score: 2, tip: 'Many funders — especially mega-donors — research orgs through public channels. Ensure your website, 990, and social media all tell the same story.' },
      { label: 'We have a basic website and some social presence', score: 1, tip: 'Your public presence IS your pitch to funders with no formal application. Invest in a clear, updated website and professional annual report.' },
      { label: 'Our public presence is minimal or outdated', score: 0, tip: 'With the rise of mega-donors who have no formal RFP process, your public materials are your primary application. Prioritize updating them.' },
    ],
  },
  {
    id: 'collaboration',
    category: 'Collaborative Readiness',
    question: 'Has your organization participated in coalitions, collaborative projects, or pooled funding?',
    options: [
      { label: 'Yes, we actively participate in coalitions and have received collaborative/pooled funding', score: 3, tip: '' },
      { label: 'We partner with other orgs but haven\'t pursued collaborative funding', score: 2, tip: 'Collaborative funds (like Borealis, The Audacious Project) are growing fast. Document your partnerships to position for pooled funding.' },
      { label: 'We\'ve done informal collaborations', score: 1, tip: 'Formalize your partnerships. Funders increasingly favor organizations that demonstrate systems-level thinking and cross-sector collaboration.' },
      { label: 'We mostly work independently', score: 0, tip: 'Start building relationships with aligned organizations. Collaborative funds and intermediary grantmakers prioritize coalition-based work.' },
    ],
  },
]

const MAX_SCORE = QUESTIONS.length * 3

// ── Helpers ──────────────────────────────────────────────────────────

function computeLevel(pct: number): ReadinessLevel {
  if (pct >= 80) return 'grant-ready'
  if (pct >= 50) return 'getting-there'
  if (pct >= 25) return 'building-foundations'
  return 'early-stage'
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
}

function getPriorityInfo(score: number): { label: string; colorClass: string } {
  if (score === 0) return { label: 'High', colorClass: 'border-red-200 bg-red-50 text-red-700' }
  if (score === 1) return { label: 'Medium', colorClass: 'border-amber-200 bg-amber-50 text-amber-700' }
  return { label: 'Low', colorClass: 'border-blue-200 bg-blue-50 text-blue-700' }
}

// ── Quiz Component ───────────────────────────────────────────────────

export function ReadinessQuiz() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [tips, setTips] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const progress = (currentStep / QUESTIONS.length) * 100

  const handleAnswer = (questionId: string, score: number, tip: string) => {
    // Build new maps locally to avoid React batching issues
    const newAnswers = { ...answers, [questionId]: score }
    const newTips = { ...tips }
    if (tip) {
      newTips[questionId] = tip
    } else {
      delete newTips[questionId]
    }

    setAnswers(newAnswers)
    setTips(newTips)

    // Auto-advance
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep((s) => s + 1), 300)
    } else {
      setTimeout(() => {
        // Save structured result
        const totalScore = Object.values(newAnswers).reduce((sum, s) => sum + s, 0)
        const percentage = Math.round((totalScore / MAX_SCORE) * 100)
        saveReadinessResult({
          id: crypto.randomUUID(),
          timestamp: new Date().toISOString(),
          totalScore,
          maxScore: MAX_SCORE,
          percentage,
          level: computeLevel(percentage),
          answers: newAnswers,
          tips: newTips,
        })
        setShowResults(true)
      }, 300)
    }
  }

  const restart = () => {
    setCurrentStep(0)
    setAnswers({})
    setTips({})
    setShowResults(false)
  }

  const totalScore = Object.values(answers).reduce((sum, s) => sum + s, 0)
  const percentage = Math.round((totalScore / MAX_SCORE) * 100)

  if (showResults) {
    return <Results percentage={percentage} answers={answers} tips={tips} onRestart={restart} />
  }

  const question = QUESTIONS[currentStep]
  const selectedScore = answers[question.id]

  return (
    <div>
      {/* Progress bar */}
      <div className="mb-8">
        <div className="mb-2 flex items-center justify-between text-xs text-muted-foreground">
          <span>Question {currentStep + 1} of {QUESTIONS.length}</span>
          <span className="rounded-full bg-muted px-2 py-0.5 font-medium">{question.category}</span>
        </div>
        <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
          <div
            className="h-full rounded-full bg-primary transition-all duration-500"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Question */}
      <div className="mb-6">
        <h2 className="mb-6 text-xl font-semibold text-foreground">
          {question.question}
        </h2>

        <div className="space-y-3">
          {question.options.map((option, i) => {
            const isSelected = selectedScore === option.score
            return (
              <button
                key={i}
                onClick={() => handleAnswer(question.id, option.score, option.tip)}
                className={`w-full rounded-xl border p-4 text-left text-sm transition-all ${
                  isSelected
                    ? 'border-primary bg-primary/5 ring-1 ring-primary'
                    : 'border-border/60 bg-card hover:border-primary/30 hover:shadow-sm'
                }`}
              >
                <span className={isSelected ? 'font-medium text-foreground' : 'text-muted-foreground'}>
                  {option.label}
                </span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setCurrentStep((s) => Math.max(0, s - 1))}
          disabled={currentStep === 0}
        >
          <ArrowLeft className="mr-1 h-4 w-4" />
          Back
        </Button>

        {answers[question.id] !== undefined && currentStep < QUESTIONS.length - 1 && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCurrentStep((s) => s + 1)}
          >
            Next
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}

        {answers[question.id] !== undefined && currentStep === QUESTIONS.length - 1 && (
          <Button
            size="sm"
            onClick={() => setShowResults(true)}
          >
            See Results
            <ArrowRight className="ml-1 h-4 w-4" />
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Results Component ────────────────────────────────────────────────

interface ResultsProps {
  percentage: number
  answers: Record<string, number>
  tips: Record<string, string>
  onRestart: () => void
}

const CONFETTI_COLORS = ['#22c55e', '#16a34a', '#86efac', '#fbbf24', '#f59e0b', '#a78bfa']
const CONFETTI_PIECES = Array.from({ length: 40 }, (_, i) => ({
  left: `${(((i * 7 + 13) * 37) % 100)}%`,
  width: `${6 + ((i * 3 + 5) % 7)}px`,
  height: `${6 + ((i * 5 + 2) % 7)}px`,
  background: CONFETTI_COLORS[i % CONFETTI_COLORS.length],
  borderRadius: i % 3 === 0 ? '50%' : '2px',
  delay: `${(i * 0.02)}s`,
}))

function Confetti() {
  return (
    <div className="pointer-events-none fixed inset-0 z-50 overflow-hidden" aria-hidden>
      {CONFETTI_PIECES.map((p, i) => (
        <div
          key={i}
          className="absolute animate-[confetti-fall_2.5s_ease-out_forwards]"
          style={{
            left: p.left,
            top: '-5%',
            width: p.width,
            height: p.height,
            background: p.background,
            borderRadius: p.borderRadius,
            animationDelay: p.delay,
            opacity: 0,
          }}
        />
      ))}
    </div>
  )
}

function Results({ percentage, answers, tips, onRestart }: ResultsProps) {
  const [showConfetti, setShowConfetti] = useState(true)
  const tipEntries = Object.entries(tips)
  const previousResult = getPreviousResult()

  useEffect(() => {
    const timer = setTimeout(() => setShowConfetti(false), 3500)
    return () => clearTimeout(timer)
  }, [])

  // Build enriched tip items with action data
  const enrichedTips = tipEntries
    .map(([questionId, tip]) => {
      const question = QUESTIONS.find((q) => q.id === questionId)
      const action = READINESS_ACTIONS.find((a) => a.questionId === questionId)
      const score = answers[questionId] ?? 0
      return { questionId, tip, question, action, score }
    })
    .sort((a, b) => a.score - b.score) // highest priority (lowest score) first

  // Split into quick wins vs longer-term
  const quickWins = enrichedTips.filter(
    (t) => t.action?.quickWin && t.action?.primaryAction
  ).sort((a, b) => (b.action?.impactWeight ?? 0) - (a.action?.impactWeight ?? 0))

  const longerTerm = enrichedTips.filter(
    (t) => !t.action?.quickWin || !t.action?.primaryAction
  ).sort((a, b) => (b.action?.impactWeight ?? 0) - (a.action?.impactWeight ?? 0))

  // Readiness level
  let level: { label: string; color: string; icon: typeof CheckCircle2; message: string }

  if (percentage >= 80) {
    level = {
      label: 'Grant Ready',
      color: 'text-emerald-600',
      icon: CheckCircle2,
      message: 'Your organization is well-prepared to apply for grants. You have strong fundamentals in place. Focus on finding the right opportunities that match your mission and capacity.',
    }
  } else if (percentage >= 50) {
    level = {
      label: 'Getting There',
      color: 'text-blue-600',
      icon: TrendingUp,
      message: 'You have a good foundation but there are a few areas to strengthen. Addressing the actions below will make your applications more competitive.',
    }
  } else if (percentage >= 25) {
    level = {
      label: 'Building Foundations',
      color: 'text-amber-600',
      icon: AlertTriangle,
      message: 'You\'re on your way, but there\'s meaningful work to do before pursuing large grants. Start with the quick wins below to build momentum.',
    }
  } else {
    level = {
      label: 'Early Stage',
      color: 'text-red-500',
      icon: XCircle,
      message: 'Your organization would benefit from building core infrastructure before applying for most grants. Focus on the foundational steps below — many can be addressed in 3-6 months.',
    }
  }

  const Icon = level.icon
  const tipsHeading = percentage >= 80 ? 'Fine-Tuning' : 'Areas to Strengthen'

  return (
    <div>
      {showConfetti && <Confetti />}

      {/* Score comparison banner */}
      {previousResult && previousResult.percentage !== percentage && (
        <div className={`mb-4 flex items-center gap-2 rounded-lg border p-3 text-sm ${
          percentage > previousResult.percentage
            ? 'border-emerald-200 bg-emerald-50/50 text-emerald-800'
            : 'border-amber-200 bg-amber-50/50 text-amber-800'
        }`}>
          {percentage > previousResult.percentage ? (
            <TrendingUp className="h-4 w-4 shrink-0" />
          ) : (
            <TrendingDown className="h-4 w-4 shrink-0" />
          )}
          <span>
            Your score {percentage > previousResult.percentage ? 'improved' : 'changed'} from{' '}
            <strong>{previousResult.percentage}%</strong> to <strong>{percentage}%</strong>
            {previousResult.timestamp && (
              <span className="text-muted-foreground"> since {formatDate(previousResult.timestamp)}</span>
            )}
          </span>
        </div>
      )}

      {/* Score header */}
      <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 text-center shadow-sm">
        <Icon className={`mx-auto mb-3 h-12 w-12 ${level.color}`} />
        <div className="mb-1 text-4xl font-bold text-foreground">{percentage}%</div>
        <div className={`mb-3 text-lg font-semibold ${level.color}`}>{level.label}</div>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          {level.message}
        </p>
      </div>

      {/* Action Plan */}
      {(quickWins.length > 0 || longerTerm.length > 0) && (
        <div className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <ClipboardCheck className="h-5 w-5 text-primary" />
            Your Action Plan
          </h3>

          {/* Quick Wins */}
          {quickWins.length > 0 && (
            <div className="mb-5">
              <p className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-emerald-700">
                <Zap className="h-4 w-4" />
                Quick Wins — do these today in GrantLink
              </p>
              <div className="space-y-2">
                {quickWins.map((item, index) => (
                  <Link
                    key={item.questionId}
                    href={item.action!.primaryAction!.href}
                    className="flex items-center gap-3 rounded-lg border border-border/50 bg-card p-3 transition-all hover:border-primary/30 hover:shadow-sm"
                  >
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-xs font-bold text-emerald-700">
                      {index + 1}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.action!.primaryAction!.label}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.action!.primaryAction!.description}
                      </p>
                    </div>
                    <span className="shrink-0 text-xs text-muted-foreground">
                      ~{item.action!.primaryAction!.estimatedMinutes} min
                    </span>
                    <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40" />
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Longer-term items */}
          {longerTerm.length > 0 && (
            <div>
              <p className="mb-2.5 flex items-center gap-1.5 text-sm font-medium text-amber-700">
                <Clock className="h-4 w-4" />
                Longer-Term — plan for these over the next 1-3 months
              </p>
              <div className="space-y-2">
                {longerTerm.map((item) => (
                  <div
                    key={item.questionId}
                    className="flex items-start gap-3 rounded-lg border border-border/50 bg-muted/30 p-3"
                  >
                    <div className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-muted-foreground/20">
                      <div className="h-1.5 w-1.5 rounded-full bg-muted-foreground/40" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-medium text-foreground">
                        {item.question?.category}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {item.tip}
                      </p>
                      {item.action?.externalResource && (
                        <a
                          href={item.action.externalResource.href}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="mt-1.5 inline-flex items-center gap-1 text-xs font-medium text-primary hover:underline"
                        >
                          <ExternalLink className="h-3 w-3" />
                          {item.action.externalResource.label}
                          <span className="text-muted-foreground">
                            — {item.action.externalResource.source}
                          </span>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Detailed Tips */}
      {enrichedTips.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            {tipsHeading} ({enrichedTips.length})
          </h3>
          <div className="space-y-3">
            {enrichedTips.map((item) => {
              const priority = getPriorityInfo(item.score)
              return (
                <div key={item.questionId} className="rounded-lg border border-border/60 bg-card p-4 shadow-sm">
                  <div className="mb-2 flex items-center justify-between">
                    <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                      {item.question?.category}
                    </p>
                    <span className={`rounded-full border px-2 py-0.5 text-[10px] font-semibold ${priority.colorClass}`}>
                      {priority.label} Priority
                    </span>
                  </div>
                  <p className="mb-3 text-sm leading-relaxed text-foreground">
                    {item.tip}
                  </p>
                  <div className="flex flex-wrap gap-2">
                    {item.action?.primaryAction && (
                      <Button asChild size="sm">
                        <Link href={item.action.primaryAction.href}>
                          {item.action.primaryAction.label}
                          <span className="ml-1 text-xs opacity-70">
                            ~{item.action.primaryAction.estimatedMinutes} min
                          </span>
                        </Link>
                      </Button>
                    )}
                    {item.action?.externalResource && (
                      <Button asChild size="sm" variant="outline">
                        <a href={item.action.externalResource.href} target="_blank" rel="noopener noreferrer">
                          <ExternalLink className="mr-1 h-3.5 w-3.5" />
                          {item.action.externalResource.label}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Next steps */}
      <div className="flex flex-col gap-3 sm:flex-row">
        <Button asChild className="flex-1">
          <Link href="/search">
            <Search className="mr-2 h-4 w-4" />
            Browse Grants
          </Link>
        </Button>
        <Button asChild variant="outline" className="flex-1">
          <Link href="/partners">
            Find Funders & Partners
          </Link>
        </Button>
        <Button variant="ghost" onClick={onRestart} className="flex-1">
          <RotateCcw className="mr-2 h-4 w-4" />
          Retake
        </Button>
      </div>
    </div>
  )
}
