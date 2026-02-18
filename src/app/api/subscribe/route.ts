import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'
import { emailSignupSchema } from '@/types/email-signup'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const result = emailSignupSchema.safeParse(body)

    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message ?? 'Invalid input' },
        { status: 400 }
      )
    }

    const { email, focusAreas, alertPreference } = result.data
    const supabase = createAdminClient()

    // Upsert subscriber (update preferences if email exists)
    const { data, error } = await supabase
      .from('email_subscribers')
      .upsert(
        {
          email: email.toLowerCase().trim(),
          alert_preference: alertPreference,
          focus_areas: focusAreas ?? [],
          is_active: true,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'email' }
      )
      .select('id, unsubscribe_token')
      .single()

    if (error) {
      console.error('Subscribe error:', error)
      return NextResponse.json(
        { error: 'Failed to save subscription' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      id: data.id,
      unsubscribeToken: data.unsubscribe_token,
    })
  } catch (err) {
    console.error('Subscribe API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
