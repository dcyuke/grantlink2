/**
 * Calendar export utilities for grant deadlines.
 * Generates .ics files and Google Calendar links.
 */

interface CalendarEvent {
  title: string
  description: string
  date: string // ISO date string (YYYY-MM-DD)
  url?: string
}

/**
 * Generate an .ics file content string for a grant deadline.
 */
export function generateICS(event: CalendarEvent): string {
  const dateStr = event.date.replace(/-/g, '')

  // Format description: plain text, escaped per ICS spec
  const desc = escapeICS(event.description)
  const title = escapeICS(event.title)
  const url = event.url || ''

  const now = new Date()
  const stamp = formatICSDate(now)

  return [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//GrantLink//Deadline Reminder//EN',
    'CALSCALE:GREGORIAN',
    'METHOD:PUBLISH',
    'BEGIN:VEVENT',
    `DTSTART;VALUE=DATE:${dateStr}`,
    `DTEND;VALUE=DATE:${dateStr}`,
    `DTSTAMP:${stamp}`,
    `SUMMARY:${title}`,
    `DESCRIPTION:${desc}`,
    url ? `URL:${url}` : '',
    // Add a reminder 7 days before
    'BEGIN:VALARM',
    'TRIGGER:-P7D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Grant deadline in 7 days',
    'END:VALARM',
    // Add a reminder 1 day before
    'BEGIN:VALARM',
    'TRIGGER:-P1D',
    'ACTION:DISPLAY',
    'DESCRIPTION:Grant deadline tomorrow',
    'END:VALARM',
    'END:VEVENT',
    'END:VCALENDAR',
  ]
    .filter(Boolean)
    .join('\r\n')
}

/**
 * Generate a Google Calendar add-event URL.
 */
export function generateGoogleCalendarUrl(event: CalendarEvent): string {
  const dateStr = event.date.replace(/-/g, '')

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.title,
    dates: `${dateStr}/${dateStr}`,
    details: event.description + (event.url ? `\n\nApply: ${event.url}` : ''),
    ...(event.url ? { sprop: `website:${event.url}` } : {}),
  })

  return `https://calendar.google.com/calendar/render?${params.toString()}`
}

/**
 * Generate an Outlook.com calendar URL.
 */
export function generateOutlookUrl(event: CalendarEvent): string {
  const params = new URLSearchParams({
    rru: 'addevent',
    subject: event.title,
    startdt: event.date,
    enddt: event.date,
    body: event.description + (event.url ? `\n\nApply: ${event.url}` : ''),
    allday: 'true',
    path: '/calendar/action/compose',
  })

  return `https://outlook.live.com/calendar/0/action/compose?${params.toString()}`
}

/**
 * Trigger a download of an .ics file in the browser.
 */
export function downloadICS(event: CalendarEvent): void {
  const content = generateICS(event)
  const blob = new Blob([content], { type: 'text/calendar;charset=utf-8' })
  const url = URL.createObjectURL(blob)

  const a = document.createElement('a')
  a.href = url
  a.download = `${slugify(event.title)}-deadline.ics`
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}

function escapeICS(text: string): string {
  return text
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function formatICSDate(date: Date): string {
  return date.toISOString().replace(/[-:]/g, '').replace(/\.\d{3}/, '')
}

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .substring(0, 60)
}
