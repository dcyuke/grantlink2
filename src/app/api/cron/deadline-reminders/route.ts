import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'

/**
 * Deadline reminder cron: sends email alerts to users who have
 * saved opportunities with upcoming deadlines.
 *
 * Runs daily at 7am UTC via Vercel Cron.
 * Sends reminders 7 days and 1 day before deadline.
 */
export async function GET(request: Request) {
  return handleReminders(request)
}

export async function POST(request: Request) {
  return handleReminders(request)
}

async function handleReminders(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
  }

  try {
    console.log('[Deadline Reminders] Starting...')
    const supabase = createAdminClient()
    const resend = new Resend(apiKey)

    // Find saved opportunities with reminders enabled and upcoming deadlines
    const { data: savedWithDeadlines, error } = await supabase
      .from('saved_opportunities')
      .select(`
        user_id, reminder_days,
        opportunities (
          id, slug, title, deadline_date, deadline_display, amount_display,
          funders ( name )
        )
      `)
      .eq('remind_before_deadline', true)

    if (error) {
      console.error('[Deadline Reminders] Error:', error)
      return NextResponse.json({ error: 'Failed to fetch data' }, { status: 500 })
    }

    if (!savedWithDeadlines || savedWithDeadlines.length === 0) {
      return NextResponse.json({ success: true, reminders_sent: 0 })
    }

    // Get user emails
    const userIds = [...new Set(savedWithDeadlines.map((s) => s.user_id))]
    const { data: { users } } = await supabase.auth.admin.listUsers()
    const userEmailMap = new Map(users?.map((u) => [u.id, u.email]) ?? [])

    let remindersSent = 0
    const now = new Date()

    for (const saved of savedWithDeadlines) {
      const opp = saved.opportunities as unknown as {
        id: string
        slug: string
        title: string
        deadline_date: string | null
        deadline_display: string | null
        amount_display: string | null
        funders: { name: string } | null
      } | null

      if (!opp?.deadline_date) continue

      const deadline = new Date(opp.deadline_date)
      const daysUntilDeadline = Math.ceil(
        (deadline.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
      )

      const reminderDays = saved.reminder_days ?? 7
      const shouldRemind = daysUntilDeadline === reminderDays || daysUntilDeadline === 1

      if (!shouldRemind) continue

      const userEmail = userEmailMap.get(saved.user_id)
      if (!userEmail) continue

      const urgency = daysUntilDeadline === 1 ? 'TOMORROW' : `in ${daysUntilDeadline} days`

      try {
        await resend.emails.send({
          from: 'GrantLink <hello@grantlink.org>',
          to: [userEmail],
          subject: `Deadline ${urgency}: ${opp.title}`,
          html: `
            <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
              <div style="text-align: center; margin-bottom: 24px;">
                <h1 style="color: #16a34a; font-size: 24px; margin: 0;">Grant<span style="color: #15803d;">Link</span></h1>
              </div>

              <div style="background-color: ${daysUntilDeadline === 1 ? '#fef2f2' : '#fffbeb'}; border: 1px solid ${daysUntilDeadline === 1 ? '#fecaca' : '#fde68a'}; border-radius: 8px; padding: 20px; margin-bottom: 24px;">
                <p style="font-size: 14px; font-weight: 600; color: ${daysUntilDeadline === 1 ? '#dc2626' : '#d97706'}; margin: 0 0 4px 0;">
                  ⏰ Deadline ${urgency}
                </p>
                <p style="font-size: 12px; color: #666; margin: 0;">
                  ${opp.deadline_display || opp.deadline_date}
                </p>
              </div>

              <h2 style="color: #1a1a1a; font-size: 18px; margin-bottom: 8px;">
                <a href="https://grantlink.org/opportunity/${opp.slug}" style="color: #16a34a; text-decoration: none;">${opp.title}</a>
              </h2>

              ${opp.funders?.name ? `<p style="color: #666; font-size: 14px; margin-bottom: 16px;">by ${opp.funders.name}</p>` : ''}
              ${opp.amount_display ? `<p style="color: #1a1a1a; font-size: 14px; margin-bottom: 16px;">💰 ${opp.amount_display}</p>` : ''}

              <div style="text-align: center; margin-top: 24px;">
                <a href="https://grantlink.org/opportunity/${opp.slug}" style="display: inline-block; background-color: #16a34a; color: white; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: 600;">
                  View Opportunity
                </a>
              </div>

              <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 16px;" />
              <p style="color: #999; font-size: 12px; text-align: center;">
                You saved this grant on <a href="https://grantlink.org" style="color: #999;">GrantLink</a>.
                Manage your saved grants in your <a href="https://grantlink.org/dashboard/saved" style="color: #999;">dashboard</a>.
              </p>
            </div>
          `,
        })
        remindersSent++
      } catch (err) {
        console.error(`[Deadline Reminders] Failed to send to ${userEmail}:`, err)
      }
    }

    console.log(`[Deadline Reminders] Sent ${remindersSent} reminders`)
    return NextResponse.json({ success: true, reminders_sent: remindersSent })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Deadline Reminders] Fatal error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}
