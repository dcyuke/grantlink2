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
      scrolled ? "h-14 border-border/40 shadow-sm" : "h-16 border-transparent"
    )}>
      <div className="container mx-auto flex h-full items-center justify-between px-4">
        {/* Logo */}
        <Link href="/" className="flex items-center">
          <span className="font-serif text-xl font-bold tracking-tight text-foreground">
            Grant<span className="text-primary">Link</span>
          </span>
        </Link>

        {/* Desktop nav — centered floating pill */}
        <nav className="hidden items-center md:flex">
          <div className="flex items-center gap-1 rounded-full border border-border/60 bg-card/80 px-1.5 py-1 backdrop-blur-sm">
            <Link
              href="/search"
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Browse Grants
            </Link>
            <Link
              href="/partners"
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Funders
            </Link>
            <Link
              href="/readiness"
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Grant Readiness
            </Link>
            <Link
              href="/impact"
              className="rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              Impact
            </Link>
            <Link
              href="/organization"
              className="flex items-center gap-1.5 rounded-full px-3.5 py-1.5 text-[13px] font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
            >
              <Building2 className="h-3.5 w-3.5" />
              {orgName || 'My Org'}
            </Link>
          </div>
        </nav>

        {/* Auth button (desktop) */}
        <div className="hidden md:flex">
          <AuthButton />
        </div>

        {/* Mobile: auth + menu */}
        <div className="flex items-center gap-2 md:hidden">
          <AuthButton />
          <button
            className="inline-flex items-center justify-center rounded-full p-2 text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Browse Grants
            </Link>
            <Link
              href="/partners"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Funders & Partners
            </Link>
            <Link
              href="/readiness"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Grant Readiness Assessment
            </Link>
            <Link
              href="/impact"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              Impact & M&E
            </Link>
            <Link
              href="/organization"
              className="flex items-center gap-2 rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              <Building2 className="h-4 w-4" />
              {orgName || 'My Organization'}
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              onClick={() => setMobileMenuOpen(false)}
            >
              My Dashboard
            </Link>
            <Link
              href="/about"
              className="rounded-lg px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
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
