import Link from 'next/link'
import { Search } from 'lucide-react'
import { FooterSignup } from './footer-signup'
import { FeedbackDialog } from '@/components/feedback-dialog'

export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-4">
          {/* Brand */}
          <div className="md:col-span-2">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary">
                <Search className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <span className="text-lg font-bold tracking-tight">
                Grant<span className="text-primary">Link</span>
              </span>
            </Link>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-muted-foreground">
              Discover funding opportunities for nonprofits and social enterprises.
              Search thousands of grants, fellowships, prizes, and more from foundations,
              corporations, and government agencies.
            </p>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Explore</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/search" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Browse All
                </Link>
              </li>
              <li>
                <Link href="/search?types=grant" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Grants
                </Link>
              </li>
              <li>
                <Link href="/search?types=fellowship" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Fellowships
                </Link>
              </li>
              <li>
                <Link href="/search?types=corporate_giving" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  Corporate Giving
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="mb-3 text-sm font-semibold text-foreground">Company</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/about" className="text-sm text-muted-foreground transition-colors hover:text-foreground">
                  About Us
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
