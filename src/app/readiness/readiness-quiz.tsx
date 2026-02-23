'use client'

import { useState } from 'react'
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
  ShieldCheck,
} from 'lucide-react'

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
]

const MAX_SCORE = QUESTIONS.length * 3

export function ReadinessQuiz() {
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState<Record<string, number>>({})
  const [tips, setTips] = useState<Record<string, string>>({})
  const [showResults, setShowResults] = useState(false)

  const progress = (currentStep / QUESTIONS.length) * 100

  const handleAnswer = (questionId: string, score: number, tip: string) => {
    setAnswers((prev) => ({ ...prev, [questionId]: score }))
    if (tip) {
      setTips((prev) => ({ ...prev, [questionId]: tip }))
    } else {
      setTips((prev) => {
        const next = { ...prev }
        delete next[questionId]
        return next
      })
    }

    // Auto-advance
    if (currentStep < QUESTIONS.length - 1) {
      setTimeout(() => setCurrentStep((s) => s + 1), 300)
    } else {
      setTimeout(() => setShowResults(true), 300)
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
    return <Results percentage={percentage} tips={tips} onRestart={restart} />
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

interface ResultsProps {
  percentage: number
  tips: Record<string, string>
  onRestart: () => void
}

function Results({ percentage, tips, onRestart }: ResultsProps) {
  const tipEntries = Object.entries(tips)

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
      message: 'You have a good foundation but there are a few areas to strengthen. Addressing the tips below will make your applications more competitive.',
    }
  } else if (percentage >= 25) {
    level = {
      label: 'Building Foundations',
      color: 'text-amber-600',
      icon: AlertTriangle,
      message: 'You\'re on your way, but there\'s meaningful work to do before pursuing large grants. Start with smaller, first-time-friendly opportunities while strengthening your infrastructure.',
    }
  } else {
    level = {
      label: 'Early Stage',
      color: 'text-red-500',
      icon: XCircle,
      message: 'Your organization would benefit from building core infrastructure before applying for most grants. Focus on the foundational areas below — many can be addressed in 3-6 months.',
    }
  }

  const Icon = level.icon

  return (
    <div>
      {/* Score header */}
      <div className="mb-8 rounded-xl border border-border/60 bg-card p-6 text-center shadow-sm">
        <Icon className={`mx-auto mb-3 h-12 w-12 ${level.color}`} />
        <div className="mb-1 text-4xl font-bold text-foreground">{percentage}%</div>
        <div className={`mb-3 text-lg font-semibold ${level.color}`}>{level.label}</div>
        <p className="mx-auto max-w-md text-sm leading-relaxed text-muted-foreground">
          {level.message}
        </p>
      </div>

      {/* Tips */}
      {tipEntries.length > 0 && (
        <div className="mb-8">
          <h3 className="mb-4 flex items-center gap-2 text-lg font-semibold text-foreground">
            <ShieldCheck className="h-5 w-5 text-primary" />
            Areas to Strengthen ({tipEntries.length})
          </h3>
          <div className="space-y-3">
            {tipEntries.map(([questionId, tip]) => {
              const question = QUESTIONS.find((q) => q.id === questionId)
              return (
                <div key={questionId} className="rounded-lg border border-amber-200 bg-amber-50/50 p-4">
                  <p className="mb-1 text-xs font-semibold uppercase tracking-wider text-amber-700">
                    {question?.category}
                  </p>
                  <p className="text-sm leading-relaxed text-foreground">
                    {tip}
                  </p>
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
            Find Corporate Partners
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
