import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { createAdminClient } from '@/lib/supabase/admin'
import { createClient } from '@/lib/supabase/server'

export async function DELETE() {
  try {
    const auth = await requireAuth()
    if (auth.error) return auth.error

    const userId = auth.user.id
    const admin = createAdminClient()

    // Get user email for email_subscribers cleanup
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()
    const userEmail = user?.email

    // Delete user data from all tables (order matters for foreign keys)
    const tables = [
      'impact_data_rows',
      'impact_column_mappings',
      'impact_datasets',
      'application_tracking',
      'saved_opportunities',
    ]

    for (const table of tables) {
      const { error } = await admin.from(table).delete().eq('user_id', userId)
      if (error) {
        console.error(`Delete ${table} error:`, error)
        return NextResponse.json(
          { error: `Failed to delete data from ${table}` },
          { status: 500 }
        )
      }
    }

    // Delete email subscriber record if exists
    if (userEmail) {
      await admin
        .from('email_subscribers')
        .delete()
        .eq('email', userEmail.toLowerCase())
    }

    // Delete the auth user
    const { error: deleteUserError } =
      await admin.auth.admin.deleteUser(userId)

    if (deleteUserError) {
      console.error('Delete auth user error:', deleteUserError)
      return NextResponse.json(
        { error: 'Failed to delete account' },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Account delete error:', err)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
