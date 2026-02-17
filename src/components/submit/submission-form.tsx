'use client'

import { useState } from 'react'
import { CheckCircle2, Loader2, Building2, FileText, Users } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { FOCUS_AREAS, FUNDER_TYPE_LABELS, OPPORTUNITY_TYPE_LABELS, POPULATION_OPTIONS, ORG_TYPE_OPTIONS } from '@/lib/constants'
import { submissionSchema } from '@/types/submission'
import type { SubmissionData } from '@/types/submission'

export function SubmissionForm() {
  const [formData, setFormData] = useState<Partial<SubmissionData>>({
    funder_type: 'private_foundation',
    opportunity_type: 'grant',
    deadline_type: 'fixed',
    focus_areas: [],
    eligible_populations: [],
    eligible_org_types: [],
    eligible_geography: [],
  })
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [status, setStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [apiError, setApiError] = useState('')

  function updateField(field: string, value: unknown) {
    setFormData((prev) => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors((prev) => {
        const next = { ...prev }
        delete next[field]
        return next
      })
    }
  }

  function toggleArrayValue(field: string, value: string) {
    setFormData((prev) => {
      const current = (prev[field as keyof SubmissionData] as string[]) ?? []
      const next = current.includes(value)
        ? current.filter((v) => v !== value)
        : [...current, value]
      return { ...prev, [field]: next }
    })
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setErrors({})
    setApiError('')

    // Parse amounts from dollars to numbers (will be converted to cents in API)
    const dataToValidate = {
      ...formData,
      amount_min: formData.amount_min ? Number(formData.amount_min) : null,
      amount_max: formData.amount_max ? Number(formData.amount_max) : null,
    }

    const result = submissionSchema.safeParse(dataToValidate)
    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const path = issue.path.join('.')
        if (!fieldErrors[path]) {
          fieldErrors[path] = issue.message
        }
      }
      setErrors(fieldErrors)
      // Scroll to first error
      const firstError = document.querySelector('[data-error="true"]')
      firstError?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }

    setStatus('submitting')
    try {
      const res = await fetch('/api/submit-opportunity', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(result.data),
      })

      if (!res.ok) {
        const body = await res.json().catch(() => ({}))
        throw new Error(body.error || 'Submission failed')
      }

      setStatus('success')
    } catch (err) {
      setApiError(err instanceof Error ? err.message : 'Something went wrong. Please try again.')
      setStatus('error')
    }
  }

  if (status === 'success') {
    return (
      <div className="mx-auto max-w-2xl rounded-xl border-2 border-emerald-200 bg-emerald-50/50 p-8 text-center">
        <CheckCircle2 className="mx-auto mb-4 h-12 w-12 text-emerald-600" />
        <h2 className="mb-2 text-2xl font-bold text-foreground">Submission Received!</h2>
        <p className="text-muted-foreground">
          Thank you for submitting your funding opportunity. Our team will review it
          and publish it within 48 hours if it meets our guidelines. You&apos;ll receive
          a confirmation at the email address you provided.
        </p>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="mx-auto max-w-2xl space-y-10">
      {/* Section 1: Funder Info */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Building2 className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Your Organization</h2>
            <p className="text-sm text-muted-foreground">Tell us about the funding organization</p>
          </div>
        </div>

        <div className="space-y-4">
          <FieldWrapper label="Organization Name" required error={errors.funder_name}>
            <Input
              value={formData.funder_name ?? ''}
              onChange={(e) => updateField('funder_name', e.target.value)}
              placeholder="e.g. Ford Foundation"
              data-error={!!errors.funder_name}
            />
          </FieldWrapper>

          <FieldWrapper label="Organization Type" required error={errors.funder_type}>
            <Select
              value={formData.funder_type}
              onValueChange={(v) => updateField('funder_type', v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(FUNDER_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>

          <FieldWrapper label="Website" error={errors.website_url}>
            <Input
              type="url"
              value={formData.website_url ?? ''}
              onChange={(e) => updateField('website_url', e.target.value)}
              placeholder="https://www.example.org"
            />
          </FieldWrapper>

          <FieldWrapper label="Contact Email" required error={errors.contact_email}>
            <Input
              type="email"
              value={formData.contact_email ?? ''}
              onChange={(e) => updateField('contact_email', e.target.value)}
              placeholder="grants@example.org"
              data-error={!!errors.contact_email}
            />
          </FieldWrapper>

          <FieldWrapper label="Organization Description" error={errors.funder_description}>
            <textarea
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              value={formData.funder_description ?? ''}
              onChange={(e) => updateField('funder_description', e.target.value)}
              placeholder="Brief description of your organization"
              rows={3}
            />
          </FieldWrapper>
        </div>
      </section>

      {/* Section 2: Opportunity Details */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Opportunity Details</h2>
            <p className="text-sm text-muted-foreground">Describe the funding opportunity</p>
          </div>
        </div>

        <div className="space-y-4">
          <FieldWrapper label="Opportunity Title" required error={errors.title}>
            <Input
              value={formData.title ?? ''}
              onChange={(e) => updateField('title', e.target.value)}
              placeholder="e.g. Community Innovation Grant 2026"
              data-error={!!errors.title}
            />
          </FieldWrapper>

          <FieldWrapper label="Opportunity Type" required error={errors.opportunity_type}>
            <Select
              value={formData.opportunity_type}
              onValueChange={(v) => updateField('opportunity_type', v)}
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(OPPORTUNITY_TYPE_LABELS).map(([value, label]) => (
                  <SelectItem key={value} value={value}>
                    {label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </FieldWrapper>

          <FieldWrapper label="Summary" required error={errors.summary}>
            <textarea
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              value={formData.summary ?? ''}
              onChange={(e) => updateField('summary', e.target.value)}
              placeholder="A brief summary of the opportunity (1-2 sentences)"
              rows={3}
              data-error={!!errors.summary}
            />
          </FieldWrapper>

          <FieldWrapper label="Full Description" error={errors.description}>
            <textarea
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-[120px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              value={formData.description ?? ''}
              onChange={(e) => updateField('description', e.target.value)}
              placeholder="Detailed description including goals, criteria, and any additional information"
              rows={5}
            />
          </FieldWrapper>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldWrapper label="Minimum Amount ($)" error={errors.amount_min}>
              <Input
                type="number"
                min="0"
                step="1"
                value={formData.amount_min ?? ''}
                onChange={(e) =>
                  updateField('amount_min', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="e.g. 5000"
              />
            </FieldWrapper>

            <FieldWrapper label="Maximum Amount ($)" error={errors.amount_max}>
              <Input
                type="number"
                min="0"
                step="1"
                value={formData.amount_max ?? ''}
                onChange={(e) =>
                  updateField('amount_max', e.target.value ? Number(e.target.value) : null)
                }
                placeholder="e.g. 50000"
              />
            </FieldWrapper>
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <FieldWrapper label="Deadline" error={errors.deadline_date}>
              <Input
                type="date"
                value={formData.deadline_date ?? ''}
                onChange={(e) => updateField('deadline_date', e.target.value)}
              />
            </FieldWrapper>

            <FieldWrapper label="Deadline Type" error={errors.deadline_type}>
              <Select
                value={formData.deadline_type}
                onValueChange={(v) => updateField('deadline_type', v)}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="fixed">Fixed Deadline</SelectItem>
                  <SelectItem value="rolling">Rolling</SelectItem>
                  <SelectItem value="continuous">Continuous</SelectItem>
                  <SelectItem value="unknown">Not Sure</SelectItem>
                </SelectContent>
              </Select>
            </FieldWrapper>
          </div>

          <FieldWrapper label="Application URL" error={errors.application_url}>
            <Input
              type="url"
              value={formData.application_url ?? ''}
              onChange={(e) => updateField('application_url', e.target.value)}
              placeholder="https://www.example.org/apply"
            />
          </FieldWrapper>
        </div>
      </section>

      {/* Section 3: Eligibility & Focus */}
      <section>
        <div className="mb-6 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h2 className="text-lg font-semibold text-foreground">Eligibility & Focus Areas</h2>
            <p className="text-sm text-muted-foreground">Who can apply and what areas does this cover?</p>
          </div>
        </div>

        <div className="space-y-6">
          <FieldWrapper label="Eligibility Summary" error={errors.eligibility_summary}>
            <textarea
              className="border-input placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/50 min-h-[80px] w-full rounded-md border bg-transparent px-3 py-2 text-sm shadow-xs outline-none focus-visible:ring-[3px]"
              value={formData.eligibility_summary ?? ''}
              onChange={(e) => updateField('eligibility_summary', e.target.value)}
              placeholder="Describe who is eligible to apply"
              rows={3}
            />
          </FieldWrapper>

          <FieldWrapper label="Geographic Scope" error={errors.geo_scope_display}>
            <Input
              value={formData.geo_scope_display ?? ''}
              onChange={(e) => updateField('geo_scope_display', e.target.value)}
              placeholder="e.g. United States, Global, California"
            />
          </FieldWrapper>

          <div>
            <label className="mb-3 block text-sm font-medium text-foreground">Focus Areas</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {FOCUS_AREAS.map((area) => (
                <label
                  key={area.slug}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <Checkbox
                    checked={formData.focus_areas?.includes(area.slug)}
                    onCheckedChange={() => toggleArrayValue('focus_areas', area.slug)}
                  />
                  <span className="text-muted-foreground">{area.name}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-foreground">Eligible Organization Types</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {ORG_TYPE_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <Checkbox
                    checked={formData.eligible_org_types?.includes(option.value)}
                    onCheckedChange={() => toggleArrayValue('eligible_org_types', option.value)}
                  />
                  <span className="text-muted-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </div>

          <div>
            <label className="mb-3 block text-sm font-medium text-foreground">Populations Served</label>
            <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
              {POPULATION_OPTIONS.map((option) => (
                <label
                  key={option.value}
                  className="flex cursor-pointer items-center gap-2 rounded-md border border-border/60 px-3 py-2 text-sm transition-colors hover:bg-accent"
                >
                  <Checkbox
                    checked={formData.eligible_populations?.includes(option.value)}
                    onCheckedChange={() => toggleArrayValue('eligible_populations', option.value)}
                  />
                  <span className="text-muted-foreground">{option.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Submit */}
      {apiError && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {apiError}
        </div>
      )}

      <div className="rounded-xl border border-border/60 bg-muted/30 p-6">
        <p className="mb-4 text-sm text-muted-foreground">
          By submitting, you confirm that this is a legitimate funding opportunity. All submissions
          are reviewed by our team before being published on GrantLink.
        </p>
        <Button
          type="submit"
          size="lg"
          className="w-full"
          disabled={status === 'submitting'}
        >
          {status === 'submitting' ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Submitting...
            </>
          ) : (
            'Submit for Review'
          )}
        </Button>
      </div>
    </form>
  )
}

function FieldWrapper({
  label,
  required,
  error,
  children,
}: {
  label: string
  required?: boolean
  error?: string
  children: React.ReactNode
}) {
  return (
    <div data-error={!!error}>
      <label className="mb-1.5 block text-sm font-medium text-foreground">
        {label}
        {required && <span className="ml-0.5 text-red-500">*</span>}
      </label>
      {children}
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
    </div>
  )
}
