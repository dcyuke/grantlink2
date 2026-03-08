import { NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createAdminClient } from '@/lib/supabase/admin'
import { FOCUS_AREAS } from '@/lib/constants'

/**
 * Weekly digest cron: sends email alerts to all active subscribers
 * with new opportunities posted in the last 7 days.
 *
 * Runs every Monday at 8am UTC via Vercel Cron.
 */
export async function GET(request: Request) {
  return handleDigest(request)
}

export async function POST(request: Request) {
  return handleDigest(request)
}

async function handleDigest(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = process.env.CRON_SECRET

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    return NextResponse.json({ error: 'RESEND_API_KEY not configured' }, { status: 500 })
  }

  const startTime = Date.now()

  try {
    console.log('[Weekly Digest] Starting...')
    const supabase = createAdminClient()
    const resend = new Resend(apiKey)

    // 1. Fetch new opportunities from the last 7 days
    const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString()

    const { data: newOpps, error: oppsError } = await supabase
      .from('opportunities')
      .select(`
        id, slug, title, summary, opportunity_type, amount_display,
        deadline_display, deadline_date,
        funders ( name ),
        opportunity_focus_areas ( focus_areas ( slug, name ) )
      `)
      .eq('is_verified', true)
      .gte('created_at', weekAgo)
      .order('created_at', { ascending: false })

    if (oppsError) {
      console.error('[Weekly Digest] Error fetching opportunities:', oppsError)
      return NextResponse.json({ error: 'Failed to fetch opportunities' }, { status: 500 })
    }

    if (!newOpps || newOpps.length === 0) {
      console.log('[Weekly Digest] No new opportunities this week, skipping.')
      return NextResponse.json({ success: true, message: 'No new opportunities', emails_sent: 0 })
    }

    console.log(`[Weekly Digest] Found ${newOpps.length} new opportunities`)

    // 2. Fetch active subscribers
    const { data: subscribers, error: subError } = await supabase
      .from('email_subscribers')
      .select('id, email, alert_preference, focus_areas, unsubscribe_token')
      .eq('is_active', true)

    if (subError) {
      console.error('[Weekly Digest] Error fetching subscribers:', subError)
      return NextResponse.json({ error: 'Failed to fetch subscribers' }, { status: 500 })
    }

    if (!subscribers || subscribers.length === 0) {
      console.log('[Weekly Digest] No active subscribers.')
      return NextResponse.json({ success: true, message: 'No subscribers', emails_sent: 0 })
    }

    console.log(`[Weekly Digest] Sending to ${subscribers.length} subscribers`)

    // 3. Build per-subscriber emails
    let emailsSent = 0
    let emailsFailed = 0

    for (const sub of subscribers) {
      // Filter opportunities based on subscriber preferences
      let relevantOpps = newOpps

      if (sub.alert_preference === 'similar_only' && sub.focus_areas && sub.focus_areas.length > 0) {
        relevantOpps = newOpps.filter((opp) => {
          const oppFocusAreas = (
            opp.opportunity_focus_areas as unknown as Array<{
              focus_areas: { slug: string; name: string } | null
            }>
          )
            ?.map((ofa) => ofa.focus_areas?.slug)
            .filter(Boolean) as string[]

          return oppFocusAreas.some((slug) => sub.focus_areas.includes(slug))
        })
      }

      if (relevantOpps.length === 0) continue

      // Build email HTML
      const html = buildDigestEmail(relevantOpps, sub)

      try {
        await resend.emails.send({
          from: 'GrantLink <hello@grantlink.org>',
          to: [sub.email],
          subject: `${relevantOpps.length} New Grant${relevantOpps.length === 1 ? '' : 's'} This Week | GrantLink`,
          html,
        })
        emailsSent++
      } catch (err) {
        console.error(`[Weekly Digest] Failed to send to ${sub.email}:`, err)
        emailsFailed++
      }
    }

    const duration = ((Date.now() - startTime) / 1000).toFixed(1)

    const response = {
      success: true,
      duration: `${duration}s`,
      new_opportunities: newOpps.length,
      subscribers: subscribers.length,
      emails_sent: emailsSent,
      emails_failed: emailsFailed,
    }

    console.log('[Weekly Digest] Complete:', JSON.stringify(response))
    return NextResponse.json(response)
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    console.error('[Weekly Digest] Fatal error:', message)
    return NextResponse.json({ success: false, error: message }, { status: 500 })
  }
}

function buildDigestEmail(
  opps: Array<Record<string, unknown>>,
  subscriber: { email: string; focus_areas: string[]; unsubscribe_token: string }
): string {
  const focusAreaNames = subscriber.focus_areas
    ?.map((slug) => FOCUS_AREAS.find((fa) => fa.slug === slug)?.name)
    .filter(Boolean)

  const oppRows = opps
    .slice(0, 10)
    .map((opp) => {
      const funder = opp.funders as { name: string } | null
      return `
        <tr>
          <td style="padding: 16px 0; border-bottom: 1px solid #f0f0f0;">
            <a href="https://grantlink.org/opportunity/${opp.slug}" style="color: #5C7C5E; font-size: 16px; font-weight: 600; text-decoration: none;">${opp.title}</a>
            ${funder?.name ? `<div style="color: #888; font-size: 13px; margin-top: 4px;">by ${funder.name}</div>` : ''}
            ${opp.summary ? `<div style="color: #555; font-size: 14px; margin-top: 6px; line-height: 1.5;">${(opp.summary as string).slice(0, 160)}${(opp.summary as string).length > 160 ? '...' : ''}</div>` : ''}
            <div style="margin-top: 8px; font-size: 13px; color: #888;">
              ${opp.amount_display ? `<span style="margin-right: 12px;">💰 ${opp.amount_display}</span>` : ''}
              ${opp.deadline_display ? `<span>📅 ${opp.deadline_display}</span>` : ''}
            </div>
          </td>
        </tr>
      `
    })
    .join('')

  return `
    <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
      <div style="text-align: center; margin-bottom: 32px;">
        <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">
          Grant<span style="color: #5C7C5E;">Link</span>
        </h1>
        <p style="color: #888; font-size: 14px; margin-top: 4px;">Weekly Grant Alert</p>
      </div>

      <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 8px;">
        ${opps.length} New Opportunit${opps.length === 1 ? 'y' : 'ies'} This Week
      </h2>

      ${
        focusAreaNames && focusAreaNames.length > 0
          ? `<p style="color: #666; font-size: 14px; margin-bottom: 24px;">Based on your interests in ${focusAreaNames.join(', ')}.</p>`
          : `<p style="color: #666; font-size: 14px; margin-bottom: 24px;">Here are the latest funding opportunities.</p>`
      }

      <table style="width: 100%; border-collapse: collapse;">
        ${oppRows}
      </table>

      ${
        opps.length > 10
          ? `<p style="text-align: center; margin-top: 24px;">
              <a href="https://grantlink.org/search?newThisWeek=true" style="color: #5C7C5E; font-size: 14px;">
                View all ${opps.length} new opportunities →
              </a>
            </p>`
          : ''
      }

      <div style="text-align: center; margin-top: 32px;">
        <a href="https://grantlink.org/search" style="display: inline-block; background-color: #5C7C5E; color: #ffffff; padding: 12px 32px; border-radius: 9999px; text-decoration: none; font-size: 15px; font-weight: 600;">
          Browse All Grants
        </a>
      </div>

      <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 16px;" />

      <p style="color: #aaa; font-size: 12px; text-align: center; line-height: 1.5; margin: 0;">
        <a href="https://grantlink.org" style="color: #5C7C5E; text-decoration: none;">GrantLink</a>
        &mdash; Free tools for small and mid-sized nonprofits.<br />
        <a href="https://grantlink.org/api/unsubscribe?token=${subscriber.unsubscribe_token}" style="color: #aaa;">Unsubscribe</a>
      </p>
    </div>
  `
}
