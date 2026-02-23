'use client'

import { useState, useRef, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { CalendarPlus, Download, ChevronDown } from 'lucide-react'
import { downloadICS, generateGoogleCalendarUrl, generateOutlookUrl } from '@/lib/calendar'

interface AddToCalendarProps {
  title: string
  deadlineDate: string // ISO date string
  applicationUrl?: string | null
  funderName?: string | null
}

export function AddToCalendar({ title, deadlineDate, applicationUrl, funderName }: AddToCalendarProps) {
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    if (open) {
      document.addEventListener('mousedown', handleClick)
      return () => document.removeEventListener('mousedown', handleClick)
    }
  }, [open])

  const event = {
    title: `Deadline: ${title}`,
    description: `Grant application deadline for "${title}"${funderName ? ` from ${funderName}` : ''}. Don't miss it!`,
    date: deadlineDate,
    url: applicationUrl || undefined,
  }

  const handleICS = () => {
    downloadICS(event)
    setOpen(false)
  }

  const googleUrl = generateGoogleCalendarUrl(event)
  const outlookUrl = generateOutlookUrl(event)

  return (
    <div className="relative" ref={ref}>
      <Button
        variant="outline"
        size="sm"
        onClick={() => setOpen(!open)}
        className="gap-1.5"
      >
        <CalendarPlus className="h-4 w-4" />
        Add to Calendar
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </Button>

      {open && (
        <div className="absolute right-0 top-full z-50 mt-1.5 w-56 rounded-lg border border-border bg-popover p-1 shadow-lg">
          <a
            href={googleUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3h-3V1.5h-1.5V3h-6V1.5H7.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V8.25h15v11.25z" />
            </svg>
            Google Calendar
          </a>
          <a
            href={outlookUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => setOpen(false)}
          >
            <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.5 3h-3V1.5h-1.5V3h-6V1.5H7.5V3h-3C3.675 3 3 3.675 3 4.5v15c0 .825.675 1.5 1.5 1.5h15c.825 0 1.5-.675 1.5-1.5v-15c0-.825-.675-1.5-1.5-1.5zm0 16.5h-15V8.25h15v11.25z" />
            </svg>
            Outlook Calendar
          </a>
          <button
            onClick={handleICS}
            className="flex w-full items-center gap-2.5 rounded-md px-3 py-2 text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          >
            <Download className="h-4 w-4" />
            Download .ics File
          </button>
        </div>
      )}
    </div>
  )
}
