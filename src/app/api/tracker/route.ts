import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: fetch user's tracked applications
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('application_tracking')
      .select(`
        id, status, notes, submitted_at, awarded_amount, sort_order, created_at, updated_at,
        opportunities (
          id, slug, title, amount_display, deadline_date, deadline_display,
          funders ( name )
        )
      `)
      .eq('user_id', user.id)
      .order('sort_order')

    if (error) {
      console.error('Fetch tracker error:', error)
      return NextResponse.json({ error: 'Failed to fetch applications' }, { status: 500 })
    }

    return NextResponse.json({ applications: data ?? [] })
  } catch (err) {
    console.error('Tracker API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: add opportunity to tracker or update status
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action } = body

    if (action === 'add') {
      const { opportunityId, status = 'researching' } = body

      const { data, error } = await supabase
        .from('application_tracking')
        .upsert(
          {
            user_id: user.id,
            opportunity_id: opportunityId,
            status,
          },
          { onConflict: 'user_id,opportunity_id' }
        )
        .select('id')
        .single()

      if (error) {
        console.error('Add tracker error:', error)
        return NextResponse.json({ error: 'Failed to add' }, { status: 500 })
      }

      return NextResponse.json({ success: true, id: data.id })
    }

    if (action === 'update') {
      const { id, status, notes, submittedAt, awardedAmount } = body

      const updates: Record<string, unknown> = { updated_at: new Date().toISOString() }
      if (status !== undefined) updates.status = status
      if (notes !== undefined) updates.notes = notes
      if (submittedAt !== undefined) updates.submitted_at = submittedAt
      if (awardedAmount !== undefined) updates.awarded_amount = awardedAmount

      const { error } = await supabase
        .from('application_tracking')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Update tracker error:', error)
        return NextResponse.json({ error: 'Failed to update' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    if (action === 'remove') {
      const { id } = body

      const { error } = await supabase
        .from('application_tracking')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id)

      if (error) {
        console.error('Remove tracker error:', error)
        return NextResponse.json({ error: 'Failed to remove' }, { status: 500 })
      }

      return NextResponse.json({ success: true })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Tracker API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
