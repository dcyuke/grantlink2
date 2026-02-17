import { NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/admin'

export async function POST(request: Request) {
  try {
    const url = new URL(request.url)
    const token = url.searchParams.get('token')
    const adminSecret = process.env.ADMIN_SECRET

    if (!token || !adminSecret || token !== adminSecret) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { opportunityId, funderId, action } = await request.json()

    if (!opportunityId || !action || !['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const supabase = createAdminClient()

    if (action === 'approve') {
      // Set opportunity as verified
      const { error: oppError } = await supabase
        .from('opportunities')
        .update({ is_verified: true })
        .eq('id', opportunityId)

      if (oppError) {
        console.error('Approve opportunity error:', oppError)
        return NextResponse.json({ error: 'Failed to approve opportunity' }, { status: 500 })
      }

      // Also verify the funder
      if (funderId) {
        const { error: funderError } = await supabase
          .from('funders')
          .update({ is_verified: true })
          .eq('id', funderId)

        if (funderError) {
          console.error('Approve funder error:', funderError)
          // Don't fail — opportunity is already approved
        }
      }

      return NextResponse.json({ success: true, action: 'approved' })
    }

    if (action === 'reject') {
      // Delete focus area links first
      await supabase
        .from('opportunity_focus_areas')
        .delete()
        .eq('opportunity_id', opportunityId)

      // Delete the opportunity
      const { error: deleteOppError } = await supabase
        .from('opportunities')
        .delete()
        .eq('id', opportunityId)

      if (deleteOppError) {
        console.error('Delete opportunity error:', deleteOppError)
        return NextResponse.json({ error: 'Failed to reject opportunity' }, { status: 500 })
      }

      // Check if the funder has any other opportunities
      if (funderId) {
        const { count } = await supabase
          .from('opportunities')
          .select('id', { count: 'exact', head: true })
          .eq('funder_id', funderId)

        // If funder has no more opportunities, delete them too
        if (count === 0) {
          await supabase.from('funders').delete().eq('id', funderId)
        }
      }

      return NextResponse.json({ success: true, action: 'rejected' })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (err) {
    console.error('Admin review error:', err)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
