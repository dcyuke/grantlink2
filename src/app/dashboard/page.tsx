import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Search, Bookmark, Bell, ClipboardList } from 'lucide-react'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Your GrantLink dashboard — saved grants, applications, and alerts.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Welcome back, {user.email}
        </p>
      </div>

      {/* Quick actions grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Link href="/search" className="group">
          <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <Search className="h-5 w-5 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Find Grants</h3>
            <p className="mt-1 text-sm text-muted-foreground">Search thousands of opportunities</p>
          </div>
        </Link>

        <Link href="/dashboard/saved" className="group">
          <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-amber-100">
              <Bookmark className="h-5 w-5 text-amber-600" />
            </div>
            <h3 className="font-semibold text-foreground">Saved Grants</h3>
            <p className="mt-1 text-sm text-muted-foreground">View your bookmarked opportunities</p>
          </div>
        </Link>

        <Link href="/dashboard/tracker" className="group">
          <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
              <ClipboardList className="h-5 w-5 text-blue-600" />
            </div>
            <h3 className="font-semibold text-foreground">Application Tracker</h3>
            <p className="mt-1 text-sm text-muted-foreground">Track your grant applications</p>
          </div>
        </Link>

        <Link href="/dashboard/alerts" className="group">
          <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <Bell className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-foreground">Alert Settings</h3>
            <p className="mt-1 text-sm text-muted-foreground">Manage your email notifications</p>
          </div>
        </Link>
      </div>

      {/* Getting started section for new users */}
      <div className="mt-8 rounded-xl border border-dashed border-border bg-muted/20 p-6">
        <h2 className="mb-3 text-lg font-semibold text-foreground">Getting Started</h2>
        <div className="space-y-3">
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              1
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Browse and save grants</p>
              <p className="text-sm text-muted-foreground">
                Use the <Link href="/search" className="text-primary hover:underline">search page</Link> to find grants,
                then click the bookmark icon to save them.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              2
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Track your applications</p>
              <p className="text-sm text-muted-foreground">
                Move grants through your pipeline from Research to Submitted to Awarded.
              </p>
            </div>
          </div>
          <div className="flex items-start gap-3">
            <span className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
              3
            </span>
            <div>
              <p className="text-sm font-medium text-foreground">Set up deadline reminders</p>
              <p className="text-sm text-muted-foreground">
                Never miss a deadline — we&apos;ll email you before your saved grants close.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
