'use client'

import { useState } from 'react'
import { MessageSquare, CheckCircle2, Send } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from '@/components/ui/dialog'
import { FEEDBACK_TYPES, feedbackSchema, type FeedbackType } from '@/types/feedback'
import { saveFeedback } from '@/lib/storage'

interface FeedbackDialogProps {
  trigger?: React.ReactNode
}

export function FeedbackDialog({ trigger }: FeedbackDialogProps) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [type, setType] = useState<FeedbackType>('general')
  const [message, setMessage] = useState('')
  const [status, setStatus] = useState<'idle' | 'success'>('idle')
  const [errors, setErrors] = useState<Record<string, string>>({})

  const resetForm = () => {
    setName('')
    setEmail('')
    setType('general')
    setMessage('')
    setStatus('idle')
    setErrors({})
  }

  const handleOpenChange = (nextOpen: boolean) => {
    setOpen(nextOpen)
    if (!nextOpen) {
      // Reset form when dialog closes
      setTimeout(resetForm, 200)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setErrors({})

    const result = feedbackSchema.safeParse({
      name: name || undefined,
      email: email || '',
      type,
      message,
    })

    if (!result.success) {
      const fieldErrors: Record<string, string> = {}
      for (const issue of result.error.issues) {
        const field = issue.path[0]
        if (field && typeof field === 'string') {
          fieldErrors[field] = issue.message
        }
      }
      setErrors(fieldErrors)
      return
    }

    saveFeedback({
      name: name || undefined,
      email: email || undefined,
      type,
      message,
    })
    setStatus('success')
  }

  const inputClasses =
    'w-full rounded-lg border border-border bg-background px-3 py-2 text-sm outline-none transition-colors focus:border-primary/40'

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger ?? (
          <button className="text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
            <span className="flex items-center gap-1.5">
              <MessageSquare className="h-3.5 w-3.5" />
              Feedback
            </span>
          </button>
        )}
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        {status === 'success' ? (
          <div className="py-8 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10">
              <CheckCircle2 className="h-7 w-7 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold text-foreground">Thank you!</h3>
            <p className="text-sm text-muted-foreground">
              Your feedback has been received. We appreciate you helping us improve GrantLink.
            </p>
          </div>
        ) : (
          <>
            <DialogHeader>
              <DialogTitle>Share Your Feedback</DialogTitle>
              <DialogDescription>
                Help us improve GrantLink. All fields except message are optional.
                You can also email us at{' '}
                <a href="mailto:grantlinkfeedback@gmail.com" className="text-primary hover:underline">
                  grantlinkfeedback@gmail.com
                </a>.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Name */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name (optional)"
                  className={inputClasses}
                />
              </div>

              {/* Email */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value)
                    if (errors.email) setErrors((prev) => ({ ...prev, email: '' }))
                  }}
                  placeholder="your@email.com (optional)"
                  className={inputClasses}
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-destructive">{errors.email}</p>
                )}
              </div>

              {/* Feedback Type */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Type of feedback
                </label>
                <div className="flex flex-wrap gap-2">
                  {FEEDBACK_TYPES.map((ft) => (
                    <button
                      key={ft.value}
                      type="button"
                      onClick={() => setType(ft.value as FeedbackType)}
                      className={`rounded-full border px-3 py-1.5 text-xs transition-all ${
                        type === ft.value
                          ? 'border-primary bg-primary/10 font-medium text-primary'
                          : 'border-border bg-card text-muted-foreground hover:border-primary/30 hover:text-foreground'
                      }`}
                    >
                      {ft.label}
                    </button>
                  ))}
                </div>
              </div>

              {/* Message */}
              <div>
                <label className="mb-1.5 block text-sm font-medium text-foreground">
                  Your feedback <span className="text-destructive">*</span>
                </label>
                <textarea
                  rows={4}
                  value={message}
                  onChange={(e) => {
                    setMessage(e.target.value)
                    if (errors.message) setErrors((prev) => ({ ...prev, message: '' }))
                  }}
                  placeholder="Tell us what's on your mind..."
                  className={`${inputClasses} resize-none`}
                />
                {errors.message && (
                  <p className="mt-1 text-xs text-destructive">{errors.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full">
                <Send className="mr-2 h-4 w-4" />
                Submit Feedback
              </Button>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  )
}
