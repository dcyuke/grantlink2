import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { checkRateLimit, getClientIp } from '@/lib/rate-limit'

export async function GET(request: Request) {
  try {
    // Rate limit: 10 requests per minute per IP
    const ip = getClientIp(request)
    const limit = checkRateLimit(ip, { max: 10, windowSeconds: 60 })
    if (!limit.success) {
      return NextResponse.json(
        { error: 'Too many requests. Please try again later.' },
        { status: 429 }
      )
    }

    const { searchParams } = new URL(request.url)
    const token = searchParams.get('token')

    if (!token) {
      return NextResponse.json({ error: 'Missing token' }, { status: 400 })
    }

    // Validate token format (must be a valid UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    if (!uuidRegex.test(token)) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 400 })
    }

    const supabase = createAdminClient()

    const { error } = await supabase
      .from('email_subscribers')
      .update({ is_active: false, updated_at: new Date().toISOString() })
      .eq('unsubscribe_token', token)

    if (error) {
      console.error('Unsubscribe error:', error)
      return NextResponse.json({ error: 'Failed to unsubscribe' }, { status: 500 })
    }

    // Redirect to a simple confirmation page
    return new Response(
      `<!DOCTYPE html>
<html>
<head><title>Unsubscribed | GrantLink</title></head>
<body style="font-family: system-ui, sans-serif; max-width: 480px; margin: 80px auto; text-align: center; padding: 20px;">
  <h1 style="color: #16a34a;">GrantLink</h1>
  <h2>You've been unsubscribed</h2>
  <p style="color: #666;">You will no longer receive weekly grant alert emails from GrantLink.</p>
  <p><a href="https://grantlink.org" style="color: #16a34a;">Return to GrantLink</a></p>
</body>
</html>`,
      {
        headers: { 'Content-Type': 'text/html' },
      }
    )
  } catch (err) {
    console.error('Unsubscribe API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
