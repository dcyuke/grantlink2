import { Resend } from 'resend'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
  try {
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
        <div style="font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 560px; margin: 0 auto; padding: 40px 20px;">
          <div style="text-align: center; margin-bottom: 32px;">
            <h1 style="color: #16a34a; font-size: 24px; margin: 0;">Grant<span style="color: #15803d;">Link</span></h1>
          </div>

          <h2 style="color: #1a1a1a; font-size: 20px; margin-bottom: 16px;">Welcome to GrantLink!</h2>

          <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
            Thank you for signing up! You're now set up to receive grant alerts — we'll notify you when new funding opportunities, fellowships, and grant programs are posted.
          </p>

          <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
            ${preferenceText} ${focusAreaText}
          </p>

          <div style="background-color: #f0fdf4; border: 1px solid #bbf7d0; border-radius: 8px; padding: 20px; margin: 24px 0;">
            <p style="color: #15803d; font-size: 14px; font-weight: 600; margin: 0 0 8px 0;">What to expect:</p>
            <ul style="color: #4a4a4a; font-size: 14px; line-height: 1.8; margin: 0; padding-left: 20px;">
              <li>Alerts when new grants matching your interests are posted</li>
              <li>Deadlines and key details at a glance</li>
              <li>Opportunities matched to your focus areas</li>
            </ul>
          </div>

          <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 16px;">
            We'll send you your first alert as soon as new matching grants are posted. In the meantime, you can browse all current opportunities at <a href="https://grantlink.org/search" style="color: #16a34a; text-decoration: underline;">grantlink.org</a>.
          </p>

          <p style="color: #4a4a4a; font-size: 15px; line-height: 1.6; margin-bottom: 4px;">
            — The GrantLink Team
          </p>

          <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 32px 0 16px;" />

          <p style="color: #999; font-size: 12px; text-align: center;">
            You're receiving this because you signed up at <a href="https://grantlink.org" style="color: #999;">grantlink.org</a>.
            Questions? Reply to this email or reach us at <a href="mailto:grantlinkfeedback@gmail.com" style="color: #999;">grantlinkfeedback@gmail.com</a>.
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
