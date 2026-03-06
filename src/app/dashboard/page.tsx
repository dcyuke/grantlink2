import Link from 'next/link'
import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import {
  Search,
  Bookmark,
  Bell,
  ClipboardList,
  Building2,
  BarChart3,
  FileText,
  Handshake,
  ClipboardCheck,
  ArrowRight,
} from 'lucide-react'
import type { Metadata } from 'next'
import { DashboardChecklist } from './dashboard-checklist'

export const metadata: Metadata = {
  title: 'Dashboard | GrantLink',
  description: 'Your GrantLink dashboard — saved grants, applications, impact tools, and more.',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
          Welcome back
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {user.email}
        </p>
      </div>

      {/* Quick actions grid */}
      <div className="mb-10 grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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

        <Link href="/impact/dashboard" className="group">
          <div className="rounded-xl border border-border/60 bg-card p-5 shadow-sm transition-all duration-200 hover:border-primary/30 hover:shadow-md">
            <div className="mb-3 flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-100">
              <BarChart3 className="h-5 w-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold text-foreground">Impact Dashboard</h3>
            <p className="mt-1 text-sm text-muted-foreground">Track and visualize your outcomes</p>
          </div>
        </Link>
      </div>

      {/* Getting started checklist (client component) */}
      <DashboardChecklist />

      {/* More tools section */}
      <div className="mt-10">
        <h2 className="mb-4 font-serif text-lg font-semibold text-foreground">More Tools</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {[
            { icon: Building2, title: 'Organization Profile', desc: 'Set up your org identity', href: '/organization', color: 'text-emerald-600' },
            { icon: ClipboardCheck, title: 'Readiness Check', desc: 'Assess your grant-readiness', href: '/readiness', color: 'text-amber-600' },
            { icon: FileText, title: 'Impact Reports', desc: 'Generate funder reports', href: '/impact/report', color: 'text-blue-600' },
            { icon: Handshake, title: 'Partner Matcher', desc: 'Find aligned corporate funders', href: '/partners', color: 'text-violet-600' },
          ].map((tool) => (
            <Link
              key={tool.title}
              href={tool.href}
              className="group flex items-center gap-3 rounded-lg border border-border/50 bg-card p-4 transition-all hover:border-primary/30 hover:shadow-sm"
            >
              <tool.icon className={`h-5 w-5 shrink-0 ${tool.color}`} />
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-foreground">{tool.title}</p>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground/40 transition-all group-hover:translate-x-0.5 group-hover:text-primary" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  )
}
