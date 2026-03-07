'use client'

import Link from 'next/link'
import { useState, useEffect, useRef } from 'react'
import { Menu, X, Building2 } from 'lucide-react'
import { FeedbackDialog } from '@/components/feedback-dialog'
import { AuthButton } from '@/components/auth/auth-button'
import { cn } from '@/lib/utils'
import { getOrgProfile } from '@/lib/org-profile-storage'

export function Header() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [orgName, setOrgName] = useState<string | null>(null)
  const ticking = useRef(false)

  useEffect(() => {
    const load = () => {
      const p = getOrgProfile()
      setOrgName(p?.name?.trim() || null)
    }
    load()
    window.addEventListener('orgProfileUpdated', load)
    return () => window.removeEventListener('orgProfileUpdated', load)
  }, [])

  useEffect(() => {
    const onScroll = () => {
      if (!ticking.current) {
        requestAnimationFrame(() => {
          setScrolled(window.scrollY > 20)
          ticking.current = false
        })
        ticking.current = true
      }
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <header className={cn(
      "sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur transition-all duration-300 supports-[backdrop-filter]:bg-background/80",
      scrolled ? "h-14 border-border/40" : "h-16 border-transparent"
    )}>
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-serif text-2xl font-bold tracking-tight text-foreground">
            Grant<span className="text-primary">Link</span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-6 md:flex">
          <Link
            href="/search"
            className="text-[13px] font-medium tracking-wide text-muted-foreground/80 transition-colors hover:text-foreground"
          >
            Browse Grants
          </Link>
          <Link
            href="/partners"
            className="text-[13px] font-medium tracking-wide text-muted-foreground/80 transition-colors hover:text-foreground"
          >
            Funders
          </Link>
          <Link
            href="/readiness"
            className="text-[13px] font-medium tracking-wide text-muted-foreground/80 transition-colors hover:text-foreground"
          >
            Grant Readiness
      </Link>
          <Link
            href="/impact"
            className="text-[13px] font-medium tracking-wide text-muted-foreground/80 transition-colors hover:text-foreground"
          >
            Impact
          </Link>
          <Link
            href="/organization"
            className="flex items-center gap-1.5 text-[13px] font-medium tracking-wide text-muted-foreground/80 transition-colors hover:text-foreground"
          >
            <Building2 className="h-3.5 w-3.5" />
            {orgName || 'My Org'}
          </Link>
          <div className="ml-2 flex items-center gap-3 border-l border-border/40 pl-4">
            <AuthButton />
          </div>
        </nav>

        {/* Mobile: auth + menu */}
        <div className="flex items-center gap-2 md:hidden">
          <AuthButton />
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile nav */}
      {mobileMenuOpen && (
        <div className="border-t border-border/40 bg-background md:hidden">
          <nav className="container mx-auto flex flex-col gap-1 px-4 py-3">
            <Link
              href="/search"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Grants
            </Link>
            <Link
              href="/partners"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Funders & Partners
            </Link>
            <Link
              href="/readiness"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Grant Readiness Assessment
            </Link>
            <Link
              href="/impact"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Impact & M&E
            </Link>
            <Link
              href="/organization"
              className="flex items-center gap-2 rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Building2 className="h-4 w-4" />
              {orgName || 'My Organization'}
            </Link>
            <Link
              href="/dashboard"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Dashboard
            </Link>
            <Link
              href="/about"
              className="rounded-md px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              About
            </Link>
            <div className="px-3 py-1">
              <FeedbackDialog
                trigger={
                  <button className="w-full rounded-md py-1.5 text-left text-sm font-medium text-muted-foreground transition-colors hover:text-foreground">
                    Feedback
                  </button>
                }
              />
            </div>
          </nav>
        </div>
      )}
    </header>
  )
}
