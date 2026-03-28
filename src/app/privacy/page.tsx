import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description: 'How GrantLink collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-3xl px-4 py-16 md:py-24">
      <h1 className="mb-2 font-serif text-4xl font-bold tracking-tight">Privacy Policy</h1>
      <p className="mb-12 text-sm text-muted-foreground">Last updated: March 28, 2026</p>

      <div className="space-y-10 text-[15px] leading-relaxed text-foreground/90">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">The short version</h2>
          <p>
            GrantLink exists to help small and mid-sized nonprofits find funding. We don&apos;t sell your data,
            we don&apos;t run ads, and we don&apos;t share your information with third parties for marketing.
            Your data is yours.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">What we collect</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Account information</strong> — If you create an account, we store your email address
              and an encrypted password (managed by Supabase Auth). We never see or store your password in plain text.
            </li>
            <li>
              <strong>Email subscriptions</strong> — If you sign up for grant alerts, we store your email
              and focus area preferences so we can send you relevant opportunities.
            </li>
            <li>
              <strong>Data you upload</strong> — Impact data (CSVs), saved opportunities, application tracking
              notes, and organization profiles are stored in your account and only accessible by you.
            </li>
            <li>
              <strong>Opportunity submissions</strong> — If you submit a funding opportunity, we store the
              funder and opportunity details you provide.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">What we don&apos;t collect</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>We don&apos;t use analytics or tracking scripts</li>
            <li>We don&apos;t use advertising cookies or pixels</li>
            <li>We don&apos;t fingerprint your browser</li>
            <li>We don&apos;t track you across other websites</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">How we use your data</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>To send you grant alerts you subscribed to</li>
            <li>To power your dashboard (saved grants, applications, impact data)</li>
            <li>To send deadline reminders for opportunities you&apos;ve saved</li>
            <li>To improve GrantLink (we may look at aggregate, anonymous usage patterns)</li>
          </ul>
          <p className="mt-3">
            We will <strong>never</strong> sell, rent, or share your personal data with advertisers,
            data brokers, or any third party for their own purposes.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Third-party services</h2>
          <p className="mb-3">We use a small number of services to operate GrantLink:</p>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Supabase</strong> — Database and authentication. Your data is stored in a Supabase
              project we control. Supabase does not use your data for their own purposes.
            </li>
            <li>
              <strong>Resend</strong> — Email delivery. We send emails (alerts, reminders) through Resend.
              They process your email address solely to deliver messages on our behalf.
            </li>
            <li>
              <strong>Vercel</strong> — Hosting. GrantLink is hosted on Vercel. They may process standard
              server logs (IP addresses, request timestamps) as part of infrastructure operations.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Cookies</h2>
          <p>
            GrantLink uses only essential cookies for authentication (keeping you logged in). We don&apos;t
            use tracking cookies, advertising cookies, or any third-party cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Your rights</h2>
          <ul className="list-disc space-y-2 pl-5">
            <li>
              <strong>Delete your account</strong> — You can delete your account and all associated data
              from your dashboard settings. This is permanent and immediate.
            </li>
            <li>
              <strong>Unsubscribe</strong> — Every email includes an unsubscribe link. One click removes
              you from all future emails.
            </li>
            <li>
              <strong>Export your data</strong> — Contact us at{' '}
              <a href="mailto:grantlinkfeedback@gmail.com" className="text-primary underline">
                grantlinkfeedback@gmail.com
              </a>{' '}
              and we&apos;ll provide a copy of your data.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Data retention</h2>
          <p>
            We keep your data for as long as your account is active. If you delete your account, we
            permanently remove all your data from our systems. Email subscriber data is retained until
            you unsubscribe, at which point your email is marked inactive and no longer used.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Changes to this policy</h2>
          <p>
            If we make meaningful changes to this policy, we&apos;ll update the date at the top and
            notify active users by email.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">Contact</h2>
          <p>
            Questions or concerns? Email us at{' '}
            <a href="mailto:grantlinkfeedback@gmail.com" className="text-primary underline">
              grantlinkfeedback@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
