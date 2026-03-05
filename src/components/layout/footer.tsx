import Link from 'next/link'
import { FooterSignup } from './footer-signup'
import { FeedbackDialog } from '@/components/feedback-dialog'

export function Footer() {
  return (
    <footer className="border-t border-border/30 bg-muted/40">
      <div className="container mx-auto px-4 py-16">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center">
              <span className="font-serif text-xl font-bold tracking-tight">
                Grant<span className="text-primary">Link</span>
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Search available grants, fellowships, prizes, and funding opportunities
              from foundations, corporations, and government agencies.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Browse All Grants
                </Link>
              </li>
              <li>
                <Link href="/partners" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Funders & Partners
                </Link>
              </li>
              <li>
                <Link href="/readiness" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Readiness Assessment
                </Link>
              </li>
              <li>
                <Link href="/search?firstTimeFriendly=true" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  First-Time Friendly
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  About Us
                </Link>
              </li>
              <li>
                <Link href="/submit" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Submit Opportunity
                </Link>
              </li>
              <li>
                <FeedbackDialog />
              </li>
              <li>
                <a href="mailto:grantlinkfeedback@gmail.com" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Contact Us
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Newsletter signup */}
        <div className="mt-8 border-t border-border/40 pt-8">
          <div className="mx-auto max-w-sm">
            <FooterSignup />
          </div>
        </div>

        <div className="mt-8 border-t border-border/40 pt-6">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} GrantLink. Built to help mission-driven organizations find the funding they deserve.
          </p>
        </div>
      </div>
    </footer>
  )
}
