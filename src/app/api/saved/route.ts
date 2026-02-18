import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

// GET: fetch user's saved opportunity IDs
export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
      .from('saved_opportunities')
      .select('opportunity_id, remind_before_deadline, created_at')
      .eq('user_id', user.id)
      .order('created_at', { ascending: false })

    if (error) {
      console.error('Fetch saved error:', error)
      return NextResponse.json({ error: 'Failed to fetch saved grants' }, { status: 500 })
    }

    return NextResponse.json({ saved: data ?? [] })
  } catch (err) {
    console.error('Saved API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// POST: toggle save/unsave an opportunity
export async function POST(request: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { opportunityId, action, remindBeforeDeadline } = await request.json()

    if (!opportunityId) {
      return NextResponse.json({ error: 'opportunityId is required' }, { status: 400 })
    }

    if (action === 'unsave') {
      const { error } = await supabase
        .from('saved_opportunities')
        .delete()
        .eq('user_id', user.id)
        .eq('opportunity_id', opportunityId)

      if (error) {
        console.error('Unsave error:', error)
        return NextResponse.json({ error: 'Failed to unsave' }, { status: 500 })
      }

      return NextResponse.json({ saved: false })
    }

    // Default: save
    const { error } = await supabase
      .from('saved_opportunities')
      .upsert(
        {
          user_id: user.id,
          opportunity_id: opportunityId,
          remind_before_deadline: remindBeforeDeadline ?? false,
        },
        { onConflict: 'user_id,opportunity_id' }
      )

    if (error) {
      console.error('Save error:', error)
      return NextResponse.json({ error: 'Failed to save' }, { status: 500 })
    }

    return NextResponse.json({ saved: true })
  } catch (err) {
    console.error('Saved API error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
