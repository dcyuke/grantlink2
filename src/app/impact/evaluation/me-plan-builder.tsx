'use client'

import { useEffect, useState, useCallback, useRef } from 'react'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  Plus,
  Trash2,
  CheckCircle2,
  Printer,
  Pencil,
  ClipboardList,
  Lightbulb,
  Heart,
  Target,
  BarChart3,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  saveMEPlan,
  getMEPlan,
  createEmptyPlan,
  ME_PLAN_EVENT,
  type MEPlan,
  type MEPlanIndicator,
} from '@/lib/me-plan-storage'

const STEPS = [
  { label: 'Your Mission', icon: Heart },
  { label: 'What You Do', icon: ClipboardList },
  { label: 'Your Results', icon: Target },
  { label: 'Tracking It', icon: BarChart3 },
  { label: 'Making It Work', icon: Lightbulb },
]

const DATA_METHODS = [
  'Sign-in sheets / attendance',
  'Surveys or questionnaires',
  'Tests or assessments',
  'Interviews or focus groups',
  'Observation',
  'Program records',
  'Partner data',
  'Other',
]

const FREQUENCY_OPTIONS = [
  'Monthly',
  'Quarterly',
  'Every 6 months',
  'Annually',
]

const RESOURCE_OPTIONS = [
  'Staff',
  'Volunteers',
  'Funding / grants',
  'Facilities / space',
  'Equipment / technology',
  'Partnerships',
  'Community relationships',
]

export function MEPlanBuilder() {
  const [plan, setPlan] = useState<MEPlan | null>(null)
  const [step, setStep] = useState(0)
  const [viewMode, setViewMode] = useState<'build' | 'view'>('build')

  // Track whether user is actively building (to ignore save-triggered events)
  const buildingRef = useRef(false)

  const loadPlan = useCallback(() => {
    // Don't switch to view mode while user is actively building
    if (buildingRef.current) return
    const existing = getMEPlan()
    if (existing) {
      setPlan(existing)
      setViewMode('view')
    } else {
      setPlan(createEmptyPlan())
      setViewMode('build')
      buildingRef.current = true
    }
  }, [])

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- initialize from localStorage on mount + subscribe
    loadPlan()
    window.addEventListener(ME_PLAN_EVENT, loadPlan)
    return () => window.removeEventListener(ME_PLAN_EVENT, loadPlan)
  }, [loadPlan])

  if (!plan) return null

  const updatePlan = (updates: Partial<MEPlan>) => {
    setPlan((prev) => (prev ? { ...prev, ...updates } : prev))
  }

  const handleSave = () => {
    if (plan) saveMEPlan(plan)
  }

  const handleFinish = () => {
    if (plan) {
      buildingRef.current = false
      saveMEPlan(plan)
      setViewMode('view')
    }
  }

  // ── View mode: display completed plan ──────────────────────
  if (viewMode === 'view') {
    return <PlanView plan={plan} onEdit={() => { buildingRef.current = true; setStep(0); setViewMode('build') }} />
  }

  // ── Build mode: step-by-step wizard ────────────────────────
  const canGoNext = (() => {
    switch (step) {
      case 0: return plan.mission.trim().length > 0
      case 1: return plan.activities.some((a) => a.trim().length > 0)
      case 2: return plan.outputs.some((o) => o.description.trim().length > 0)
      case 3: return true
      case 4: return true
      default: return true
    }
  })()

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <Link
          href="/impact"
          className="mb-4 inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Impact
        </Link>
        <h1 className="mb-2 font-serif text-3xl font-bold tracking-tight text-foreground">
          Evaluation Plan Builder
        </h1>
        <p className="text-muted-foreground">
          Answer a few simple questions to create your monitoring &amp; evaluation plan.
          No jargon — just clear, practical steps.
        </p>
      </div>

      {/* Progress */}
      <div className="mb-8">
        <div className="mb-3 flex items-center justify-between text-xs text-muted-foreground">
          <span>Step {step + 1} of {STEPS.length}</span>
          <span className="flex items-center gap-1.5 rounded-full bg-muted px-2.5 py-0.5 font-medium">
            {(() => { const StepIcon = STEPS[step].icon; return <StepIcon className="h-3 w-3" /> })()}
            {STEPS[step].label}
          </span>
        </div>
        <div className="flex gap-1">
          {STEPS.map((_, i) => (
            <div
              key={i}
              className={`h-2 flex-1 rounded-full transition-colors ${
                i <= step ? 'bg-primary' : 'bg-muted'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step content */}
      <div className="mb-8 min-h-[300px]">
        {step === 0 && <StepMission plan={plan} onChange={updatePlan} />}
        {step === 1 && <StepActivities plan={plan} onChange={updatePlan} />}
        {step === 2 && <StepResults plan={plan} onChange={updatePlan} />}
        {step === 3 && <StepTracking plan={plan} onChange={updatePlan} />}
        {step === 4 && <StepImplementation plan={plan} onChange={updatePlan} />}
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between border-t border-border/30 pt-6">
        <button
          onClick={() => { handleSave(); setStep((s) => Math.max(0, s - 1)) }}
          className={`flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground ${step === 0 ? 'invisible' : ''}`}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Back
        </button>
        {step < STEPS.length - 1 ? (
          <Button
            onClick={() => { handleSave(); setStep((s) => s + 1) }}
            disabled={!canGoNext}
            className="gap-2"
          >
            Next
            <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={handleFinish} className="gap-2">
            <CheckCircle2 className="h-4 w-4" />
            Finish Plan
          </Button>
        )}
      </div>
    </div>
  )
}

// ── Step 1: Your Mission ──────────────────────────────────────────

function StepMission({ plan, onChange }: { plan: MEPlan; onChange: (u: Partial<MEPlan>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          What is your organization&apos;s mission?
        </label>
        <p className="mb-2 text-xs text-muted-foreground">
          In one or two sentences, what does your organization exist to do?
        </p>
        <textarea
          value={plan.mission}
          onChange={(e) => onChange({ mission: e.target.value })}
          placeholder="e.g., We provide after-school tutoring to help kids in our community succeed in school."
          className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
          rows={3}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Who do you serve?
        </label>
        <p className="mb-2 text-xs text-muted-foreground">
          Describe the people or communities that benefit from your work.
        </p>
        <textarea
          value={plan.targetPopulation}
          onChange={(e) => onChange({ targetPopulation: e.target.value })}
          placeholder="e.g., Low-income middle school students in the downtown area."
          className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
          rows={2}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          What change do you ultimately want to see?
        </label>
        <p className="mb-2 text-xs text-muted-foreground">
          Think big picture — the world you&apos;re working toward.
        </p>
        <textarea
          value={plan.intendedChange}
          onChange={(e) => onChange({ intendedChange: e.target.value })}
          placeholder="e.g., Every child in our community graduates high school and has a pathway to higher education or a career."
          className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
          rows={3}
        />
      </div>
    </div>
  )
}

// ── Step 2: What You Do ───────────────────────────────────────────

function StepActivities({ plan, onChange }: { plan: MEPlan; onChange: (u: Partial<MEPlan>) => void }) {
  const addActivity = () => {
    onChange({ activities: [...plan.activities, ''] })
  }
  const removeActivity = (i: number) => {
    onChange({ activities: plan.activities.filter((_, idx) => idx !== i) })
  }
  const updateActivity = (i: number, val: string) => {
    const updated = [...plan.activities]
    updated[i] = val
    onChange({ activities: updated })
  }

  const toggleResource = (resource: string) => {
    const has = plan.resources.includes(resource)
    onChange({
      resources: has
        ? plan.resources.filter((r) => r !== resource)
        : [...plan.resources, resource],
    })
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          What are your main programs or activities?
        </label>
        <p className="mb-3 text-xs text-muted-foreground">
          List the things your organization does day-to-day. You can add as many as you need.
        </p>
        <div className="space-y-2">
          {plan.activities.map((activity, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={activity}
                onChange={(e) => updateActivity(i, e.target.value)}
                placeholder={`e.g., ${['After-school tutoring sessions', 'Summer reading program', 'Parent engagement workshops'][i] ?? 'Another activity…'}`}
                className="flex-1 rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              {plan.activities.length > 1 && (
                <button
                  onClick={() => removeActivity(i)}
                  className="rounded-md px-2 text-muted-foreground hover:text-red-500"
                >
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button
            onClick={addActivity}
            className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80"
          >
            <Plus className="h-3.5 w-3.5" />
            Add another activity
          </button>
        </div>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          What resources does your organization use?
        </label>
        <p className="mb-3 text-xs text-muted-foreground">
          Select all that apply — these are the inputs that make your work possible.
        </p>
        <div className="flex flex-wrap gap-2">
          {RESOURCE_OPTIONS.map((resource) => {
            const selected = plan.resources.includes(resource)
            return (
              <button
                key={resource}
                onClick={() => toggleResource(resource)}
                className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                  selected
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-border/60 text-muted-foreground hover:border-primary/30'
                }`}
              >
                {resource}
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ── Step 3: Your Results ──────────────────────────────────────────

function StepResults({ plan, onChange }: { plan: MEPlan; onChange: (u: Partial<MEPlan>) => void }) {
  const addOutput = () => {
    onChange({ outputs: [...plan.outputs, { description: '', method: '', frequency: '' }] })
  }
  const removeOutput = (i: number) => {
    onChange({ outputs: plan.outputs.filter((_, idx) => idx !== i) })
  }
  const updateOutput = (i: number, field: keyof MEPlanIndicator, val: string) => {
    const updated = [...plan.outputs]
    updated[i] = { ...updated[i], [field]: val }
    onChange({ outputs: updated })
  }

  const addOutcome = () => {
    onChange({ outcomes: [...plan.outcomes, { description: '', method: '', frequency: '' }] })
  }
  const removeOutcome = (i: number) => {
    onChange({ outcomes: plan.outcomes.filter((_, idx) => idx !== i) })
  }
  const updateOutcome = (i: number, field: keyof MEPlanIndicator, val: string) => {
    const updated = [...plan.outcomes]
    updated[i] = { ...updated[i], [field]: val }
    onChange({ outcomes: updated })
  }

  return (
    <div className="space-y-8">
      {/* Outputs */}
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          What can you count right away?
        </label>
        <p className="mb-3 text-xs text-muted-foreground">
          These are the direct products of your work — things like workshops held,
          people served, or resources distributed. Funders call these &quot;outputs.&quot;
        </p>
        <div className="space-y-2">
          {plan.outputs.map((output, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={output.description}
                onChange={(e) => updateOutput(i, 'description', e.target.value)}
                placeholder={`e.g., ${['Number of tutoring sessions held', 'Number of students enrolled', 'Hours of instruction provided'][i] ?? 'Another thing you can count…'}`}
                className="flex-1 rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              {plan.outputs.length > 1 && (
                <button onClick={() => removeOutput(i)} className="rounded-md px-2 text-muted-foreground hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button onClick={addOutput} className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80">
            <Plus className="h-3.5 w-3.5" /> Add another
          </button>
        </div>
      </div>

      {/* Outcomes */}
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          What changes do you expect to see in 1–2 years?
        </label>
        <p className="mb-3 text-xs text-muted-foreground">
          These are changes in the people or communities you serve — like improved
          skills, increased confidence, or better health. Funders call these &quot;outcomes.&quot;
        </p>
        <div className="space-y-2">
          {plan.outcomes.map((outcome, i) => (
            <div key={i} className="flex gap-2">
              <input
                type="text"
                value={outcome.description}
                onChange={(e) => updateOutcome(i, 'description', e.target.value)}
                placeholder={`e.g., ${['Students improve reading scores by one grade level', 'Participants report increased confidence', 'Families report better access to resources'][i] ?? 'Another expected change…'}`}
                className="flex-1 rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
              />
              {plan.outcomes.length > 1 && (
                <button onClick={() => removeOutcome(i)} className="rounded-md px-2 text-muted-foreground hover:text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              )}
            </div>
          ))}
          <button onClick={addOutcome} className="flex items-center gap-1 text-xs font-medium text-primary hover:text-primary/80">
            <Plus className="h-3.5 w-3.5" /> Add another
          </button>
        </div>
      </div>

      {/* Long-term impact */}
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          What&apos;s the big-picture difference you&apos;re working toward?
        </label>
        <p className="mb-2 text-xs text-muted-foreground">
          Think 5–10 years out. This is the lasting change you hope to create.
        </p>
        <textarea
          value={plan.longTermImpact}
          onChange={(e) => onChange({ longTermImpact: e.target.value })}
          placeholder="e.g., All students in our community graduate high school prepared for college or a career."
          className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
          rows={3}
        />
      </div>
    </div>
  )
}

// ── Step 4: How You'll Track It ───────────────────────────────────

function StepTracking({ plan, onChange }: { plan: MEPlan; onChange: (u: Partial<MEPlan>) => void }) {
  const allIndicators = [
    ...plan.outputs.filter((o) => o.description.trim()),
    ...plan.outcomes.filter((o) => o.description.trim()),
  ]

  const updateIndicator = (desc: string, field: 'method' | 'frequency', val: string) => {
    const inOutputs = plan.outputs.findIndex((o) => o.description === desc)
    if (inOutputs >= 0) {
      const updated = [...plan.outputs]
      updated[inOutputs] = { ...updated[inOutputs], [field]: val }
      onChange({ outputs: updated })
      return
    }
    const inOutcomes = plan.outcomes.findIndex((o) => o.description === desc)
    if (inOutcomes >= 0) {
      const updated = [...plan.outcomes]
      updated[inOutcomes] = { ...updated[inOutcomes], [field]: val }
      onChange({ outcomes: updated })
    }
  }

  const getIndicator = (desc: string): MEPlanIndicator => {
    return (
      plan.outputs.find((o) => o.description === desc) ??
      plan.outcomes.find((o) => o.description === desc) ??
      { description: desc, method: '', frequency: '' }
    )
  }

  if (allIndicators.length === 0) {
    return (
      <div className="rounded-lg border border-dashed border-border/60 py-12 text-center">
        <p className="text-sm text-muted-foreground">
          Go back and add some outputs or outcomes first — then we&apos;ll help you figure out how to track them.
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="mb-1 text-sm font-medium text-foreground">
          For each thing you&apos;re tracking, tell us how you&apos;ll collect the information.
        </h2>
        <p className="mb-4 text-xs text-muted-foreground">
          Don&apos;t worry about getting it perfect — you can always adjust later.
        </p>
      </div>

      {allIndicators.map((indicator) => {
        const current = getIndicator(indicator.description)
        return (
          <div
            key={indicator.description}
            className="rounded-lg border border-border/50 bg-card p-4"
          >
            <p className="mb-3 text-sm font-medium text-foreground">
              {indicator.description}
            </p>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                  How will you collect this?
                </label>
                <select
                  value={current.method}
                  onChange={(e) => updateIndicator(indicator.description, 'method', e.target.value)}
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="">Select a method…</option>
                  {DATA_METHODS.map((m) => (
                    <option key={m} value={m}>{m}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="mb-1 block text-[10px] uppercase tracking-wider text-muted-foreground">
                  How often?
                </label>
                <select
                  value={current.frequency}
                  onChange={(e) => updateIndicator(indicator.description, 'frequency', e.target.value)}
                  className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
                >
                  <option value="">Select frequency…</option>
                  {FREQUENCY_OPTIONS.map((f) => (
                    <option key={f} value={f}>{f}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        )
      })}
    </div>
  )
}

// ── Step 5: Making It Work ────────────────────────────────────────

function StepImplementation({ plan, onChange }: { plan: MEPlan; onChange: (u: Partial<MEPlan>) => void }) {
  return (
    <div className="space-y-6">
      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Who will be responsible for collecting and tracking data?
        </label>
        <p className="mb-2 text-xs text-muted-foreground">
          This could be a specific person, a role, or a team.
        </p>
        <input
          type="text"
          value={plan.dataResponsible}
          onChange={(e) => onChange({ dataResponsible: e.target.value })}
          placeholder="e.g., Program Coordinator, Data & Impact Team"
          className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          How often will your team review the data together?
        </label>
        <p className="mb-2 text-xs text-muted-foreground">
          Regular check-ins help you spot trends and make adjustments.
        </p>
        <select
          value={plan.reviewFrequency}
          onChange={(e) => onChange({ reviewFrequency: e.target.value })}
          className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
        >
          <option value="">Select frequency…</option>
          {FREQUENCY_OPTIONS.map((f) => (
            <option key={f} value={f}>{f}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          What support or training does your team need?
        </label>
        <p className="mb-2 text-xs text-muted-foreground">
          Think about what would help your team feel confident collecting and using data.
        </p>
        <textarea
          value={plan.trainingNeeds}
          onChange={(e) => onChange({ trainingNeeds: e.target.value })}
          placeholder="e.g., Training on how to use surveys effectively, help setting up a spreadsheet"
          className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
          rows={3}
        />
      </div>

      <div>
        <label className="mb-1 block text-sm font-medium text-foreground">
          Any challenges you anticipate?
        </label>
        <p className="mb-2 text-xs text-muted-foreground">
          It&apos;s okay if data collection feels hard — naming the challenges is the first step.
        </p>
        <textarea
          value={plan.challenges}
          onChange={(e) => onChange({ challenges: e.target.value })}
          placeholder="e.g., Limited staff time, hard to follow up with participants after they leave the program"
          className="w-full rounded-md border border-border/60 bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground/50 focus:border-primary/40 focus:outline-none focus:ring-1 focus:ring-primary/30"
          rows={3}
        />
      </div>
    </div>
  )
}

// ── Plan View (printable) ─────────────────────────────────────────

function PlanView({ plan, onEdit }: { plan: MEPlan; onEdit: () => void }) {
  const handlePrint = () => {
    window.print()
  }

  return (
    <div>
      {/* Toolbar */}
      <div className="mb-8 flex items-center justify-between print:hidden">
        <Link
          href="/impact"
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Impact
        </Link>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={onEdit} className="gap-1.5">
            <Pencil className="h-3.5 w-3.5" />
            Edit Plan
          </Button>
          <Button size="sm" onClick={handlePrint} className="gap-1.5">
            <Printer className="h-3.5 w-3.5" />
            Print / PDF
          </Button>
        </div>
      </div>

      {/* Printable plan */}
      <div className="me-plan-content">
        <div className="mb-10 border-b border-border/30 pb-6 text-center" style={{ breakInside: 'avoid' }}>
          <h1 className="mb-1 font-serif text-3xl font-bold text-foreground">
            Monitoring &amp; Evaluation Plan
          </h1>
          <p className="text-sm text-muted-foreground">
            Created with GrantLink
          </p>
        </div>

        <div className="space-y-8">
          {/* Mission */}
          {plan.mission && (
            <section style={{ breakInside: 'avoid' }}>
              <h2 className="mb-3 font-serif text-xl font-semibold text-foreground">
                Our Mission
              </h2>
              <p className="text-sm leading-relaxed text-foreground">{plan.mission}</p>
              {plan.targetPopulation && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Who we serve:</span>{' '}
                  {plan.targetPopulation}
                </p>
              )}
              {plan.intendedChange && (
                <p className="mt-2 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">The change we seek:</span>{' '}
                  {plan.intendedChange}
                </p>
              )}
            </section>
          )}

          {/* Activities */}
          {plan.activities.some((a) => a.trim()) && (
            <section style={{ breakInside: 'avoid' }}>
              <h2 className="mb-3 font-serif text-xl font-semibold text-foreground">
                What We Do
              </h2>
              <ul className="space-y-1">
                {plan.activities.filter((a) => a.trim()).map((a, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-foreground">
                    <span className="mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-primary/60" />
                    {a}
                  </li>
                ))}
              </ul>
              {plan.resources.length > 0 && (
                <p className="mt-3 text-sm text-muted-foreground">
                  <span className="font-medium text-foreground">Resources:</span>{' '}
                  {plan.resources.join(', ')}
                </p>
              )}
            </section>
          )}

          {/* Logic Model Table */}
          {(plan.outputs.some((o) => o.description.trim()) || plan.outcomes.some((o) => o.description.trim())) && (
            <section style={{ breakInside: 'avoid' }}>
              <h2 className="mb-3 font-serif text-xl font-semibold text-foreground">
                What We&apos;re Measuring
              </h2>
              <div className="overflow-x-auto rounded-lg border border-border/40">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border/30 bg-muted/30">
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">What We Track</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Type</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Method</th>
                      <th className="px-4 py-3 text-left font-medium text-muted-foreground">Frequency</th>
                    </tr>
                  </thead>
                  <tbody>
                    {plan.outputs.filter((o) => o.description.trim()).map((o, i) => (
                      <tr key={`o-${i}`} className="border-b border-border/20">
                        <td className="px-4 py-3 text-foreground">{o.description}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary">Output</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{o.method || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{o.frequency || '—'}</td>
                      </tr>
                    ))}
                    {plan.outcomes.filter((o) => o.description.trim()).map((o, i) => (
                      <tr key={`oc-${i}`} className="border-b border-border/20 last:border-0">
                        <td className="px-4 py-3 text-foreground">{o.description}</td>
                        <td className="px-4 py-3">
                          <span className="rounded-full bg-amber-500/10 px-2 py-0.5 text-xs font-medium text-amber-700">Outcome</span>
                        </td>
                        <td className="px-4 py-3 text-muted-foreground">{o.method || '—'}</td>
                        <td className="px-4 py-3 text-muted-foreground">{o.frequency || '—'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* Long-term impact */}
          {plan.longTermImpact && (
            <section style={{ breakInside: 'avoid' }}>
              <h2 className="mb-3 font-serif text-xl font-semibold text-foreground">
                Long-Term Impact
              </h2>
              <p className="text-sm leading-relaxed text-foreground">{plan.longTermImpact}</p>
            </section>
          )}

          {/* Implementation */}
          {(plan.dataResponsible || plan.reviewFrequency) && (
            <section style={{ breakInside: 'avoid' }}>
              <h2 className="mb-3 font-serif text-xl font-semibold text-foreground">
                Implementation Plan
              </h2>
              <div className="space-y-2 text-sm">
                {plan.dataResponsible && (
                  <p className="text-foreground">
                    <span className="font-medium">Data collection lead:</span>{' '}
                    <span className="text-muted-foreground">{plan.dataResponsible}</span>
                  </p>
                )}
                {plan.reviewFrequency && (
                  <p className="text-foreground">
                    <span className="font-medium">Data review frequency:</span>{' '}
                    <span className="text-muted-foreground">{plan.reviewFrequency}</span>
                  </p>
                )}
                {plan.trainingNeeds && (
                  <p className="text-foreground">
                    <span className="font-medium">Training needs:</span>{' '}
                    <span className="text-muted-foreground">{plan.trainingNeeds}</span>
                  </p>
                )}
                {plan.challenges && (
                  <p className="text-foreground">
                    <span className="font-medium">Anticipated challenges:</span>{' '}
                    <span className="text-muted-foreground">{plan.challenges}</span>
                  </p>
                )}
              </div>
            </section>
          )}
        </div>

        {/* Footer */}
        <div className="mt-12 border-t border-border/30 pt-6 text-center text-xs text-muted-foreground">
          <p>
            Generated by{' '}
            <span className="font-medium text-foreground">GrantLink</span> ·
            Impact Measurement Tools for Nonprofits
          </p>
        </div>
      </div>

      {/* Print styles */}
      <style jsx global>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print\\:hidden {
            display: none !important;
          }
          .me-plan-content,
          .me-plan-content * {
            visibility: visible !important;
          }
          .me-plan-content {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 0 2rem;
          }
          table {
            break-inside: avoid;
          }
          @page {
            margin: 0.75in;
          }
          * {
            print-color-adjust: exact;
            -webkit-print-color-adjust: exact;
          }
        }
      `}</style>
    </div>
  )
}
