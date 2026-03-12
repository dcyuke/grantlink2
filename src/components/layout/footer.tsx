import Link from 'next/link'
import { FooterSignup } from './footer-signup'
import { FeedbackDialog } from '@/components/feedback-dialog'

export function Footer() {
  return (
    <footer className="border-t border-footer-border bg-footer-bg">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center">
              <span className="font-serif text-xl font-bold tracking-tight text-footer-fg">
                Grant<span className="text-primary">Link</span>
              </span>
            </Link>
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-footer-muted">
              Connected tools that help small nonprofits find funding, prove impact, and focus on what matters most.
            </p>
          </div>

          {/* Find Funding */}
          <div>
            <h3 className="mb-4 text-xs font-medium tracking-widest uppercase text-footer-muted/70">Find Funding</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/search" className="text-sm text-footer-muted transition-colors hover:text-footer-fg">
                  Browse All Grants
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-sm text-footer-muted transition-colors hover:text-footer-fg">
                  Funders & Partners
                </Link>
              </li>
              <li>
                <Link href="/search?firstTimeFriendly=true" className="text-sm text-footer-muted transition-colors hover:text-footer-fg">
                  First-Time Friendly
                </Link>
              </li>
              <li>
                <Link href="/readiness" className="text-sm text-footer-muted transition-colors hover:text-footer-fg">
                  Readiness Assessment
                </Link>
              </li>
            </ul>
          </div>

          {/* Your Toolkit */}
          <div>
            <h3 className="mb-4 text-xs font-medium tracking-widest uppercase text-footer-muted/70">Your Toolkit</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/organization" className="text-sm text-footer-muted transition-colors hover:text-footer-fg">
                  Organization Profile
                </Link>
              </li>
              <li>
                <Link href="/impact" className="text-sm text-footer-muted transition-colors hover:text-footer-fg">
                  Impact Dashboard
                </Link>
              </li>
              <li>
                <Link href="/impact/evaluation" className="text-sm text-footer-muted transition-colors hover:text-footer-fg">
                  M&E Plan Builder
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-sm text-footer-muted transition-colors hover:text-footer-fg">
                  My Dashboard
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h3 className="mb-4 text-xs font-medium tracking-widest uppercase text-footer-muted/70">Company</h3>
            <ul className="space-y-2.5">
              <li>
                <Link href="/about" className="text-sm text-footer-muted transition-colors hover:text-footer-fg">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-sm text-footer-muted transition-colors hover:text-footer-fg">
                  Submit Opportunity
                </Link>
              </li>
              <li>
                <FeedbackDialog />
              </li>
              <li>
                <a href="mailto:grantlinkfeedback@gmail.com" className="text-sm text-footer-muted transition-colors hover:text-footer-fg">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="mt-10 border-t border-footer-border pt-10">
          <div className="mx-auto max-w-sm">
            <FooterSignup />
          </div>
        </div>

        <div className="mt-10 border-t border-footer-border pt-6">
          <p className="text-center text-xs text-footer-muted/50">
            &copy; {new Date().getFullYear()} GrantLink. Built for small and mid-sized nonprofits doing big work.
          </p>
        </div>
      </div>
    </footer>
  )
}
