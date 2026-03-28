import { NextResponse } from 'next/server'
import { requireAuth } from '@/lib/auth-guard'
import { createAdminClient } from '@/lib/supabase/admin'

export async function DELETE() {
  const auth = await requireAuth()
  if (auth.error) return auth.error

  const userId = auth.user.id
  const admin = createAdminClient()

  // Delete all user data from every table that references user_id
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
      console.error(`Failed to delete from ${table}:`, error.message)
      return NextResponse.json(
        { error: `Failed to delete data from ${table}` },
        { status: 500 }
      )
    }
  }

  // Remove email subscription if their auth email matches
  const email = auth.user.email
  if (email) {
    await admin.from('email_subscribers').delete().eq('email', email)
  }

  // Delete the auth user (this also invalidates all sessions)
  const { error: deleteError } = await admin.auth.admin.deleteUser(userId)
  if (deleteError) {
    console.error('Failed to delete auth user:', deleteError.message)
    return NextResponse.json(
      { error: 'Failed to delete account' },
      { status: 500 }
    )
  }

  return NextResponse.json({ success: true })
}
