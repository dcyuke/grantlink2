import { Resend } from 'resend'
import { NextResponse } from 'next/server'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function POST(request: Request) {
  try {
    // Rate limit: 5 requests per minute per IP
    const ip = getClientIp(request)
    const limit = checkRateLimit(ip, { max: 5, windowSeconds: 60 })
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const apiKey = process.env.RESEND_API_KEY
    if (!apiKey) {
      console.error('RESEND_API_KEY is not set')
      return NextResponse.json({ error: 'Email service not configured' }, { status: 500 })
    }

    const resend = new Resend(apiKey)
    const { email, focusAreas, alertPreference } = await request.json()

    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 })
    }

    const preferenceText =
      alertPreference === 'similar_only'
        ? `You've chosen to receive alerts for grants similar to your selected interests.`
        : `You've chosen to receive alerts for all new grants.`

    const focusAreaText =
      focusAreas && focusAreas.length > 0
        ? `Based on your interests in ${focusAreas.join(', ')}, we'll make sure your alerts are tailored to the opportunities that matter most to you.`
        : `We'll send you alerts across all focus areas.`

    const { data, error } = await resend.emails.send({
      from: 'GrantLink <hello@grantlink.org>',
      to: [email],
      subject: 'Welcome to GrantLink! Your Grant Alerts Are Set Up',
      html: `
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px; color: #1a1a1a;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="font-family: Georgia, 'Times New Roman', serif; font-size: 26px; font-weight: 700; margin: 0; letter-spacing: -0.5px;">
              Grant<span style="color: #5C7C5E;">Link</span>
            </h1>
          </div>

          <h2 style="font-size: 20px; font-weight: 600; margin: 0 0 16px; text-align: center;">Welcome to GrantLink!</h2>

          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
            Thank you for signing up! You're now set up to receive grant alerts — we'll notify you when new funding opportunities, fellowships, and grant programs are posted.
          </p>

          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 16px;">
            \${preferenceText} \${focusAreaText}
          </p>

          <div style="background-color: #F2F7F3; border: 1px solid #D4E0D5; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="color: #4A664C; font-size: 14px; font-weight: 600; margin: 0 0 8px;">What to expect:</p>
            <ul style="color: #555; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Alerts when new grants matching your interests are posted</li>
              <li>Deadlines and key details at a glance</li>
              <li>Opportunities matched to your focus areas</li>
            </ul>
          </div>

          <div style="text-align: center; margin: 28px 0;">
            <a href="https://grantlink.org/search"
               style="display: inline-block; background-color: #5C7C5E; color: #ffffff; font-size: 15px; font-weight: 600; text-decoration: none; padding: 12px 32px; border-radius: 9999px;">
              Browse Grants
            </a>
          </div>

          <p style="color: #555; font-size: 15px; line-height: 1.6; margin: 0 0 4px;">
            — The GrantLink Team
          </p>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 16px;" />

          <p style="color: #aaa; font-size: 12px; text-align: center; line-height: 1.5; margin: 0;">
            <a href="https://grantlink.org" style="color: #5C7C5E; text-decoration: none;">GrantLink</a>
            &mdash; Tools for small and mid-sized nonprofits.<br />
            Questions? <a href="mailto:grantlinkfeedback@gmail.com" style="color: #aaa;">Contact us</a>
          </p>
        </div>
      `,
    })

    if (error) {
      console.error('Resend error:', error)
      return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
    }

    return NextResponse.json({ success: true, id: data?.id })
  } catch (err) {
    console.error('API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
