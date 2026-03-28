import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Privacy Policy | GrantLink',
  description: 'How GrantLink collects, uses, and protects your data.',
}

export default function PrivacyPage() {
  return (
    <div className="container mx-auto max-w-2xl px-4 py-16">
      <h1 className="mb-2 font-serif text-3xl font-bold text-foreground">
        Privacy Policy
      </h1>
      <p className="mb-10 text-sm text-muted-foreground">
        Last updated: March 2026
      </p>

      <div className="space-y-8 text-[15px] leading-relaxed text-muted-foreground">
        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            What We Collect
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Account info</strong> &mdash; email address when you sign
              up or subscribe to alerts.
            </li>
            <li>
              <strong>Organization profile</strong> &mdash; nonprofit details
              you choose to enter (name, EIN, mission, etc.).
            </li>
            <li>
              <strong>Impact data</strong> &mdash; datasets you upload to the
              impact dashboard.
            </li>
            <li>
              <strong>Usage data</strong> &mdash; saved grants, application
              tracker entries, focus area preferences.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            What We Do NOT Collect
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>No analytics or tracking scripts (no Google Analytics).</li>
            <li>No advertising cookies or pixels.</li>
            <li>No third-party data brokers or ad networks.</li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            How We Use Your Data
          </h2>
          <p>
            Your data is used solely to provide GrantLink&apos;s features:
            matching grants, sending alerts, tracking applications, and
            measuring impact. We never sell, rent, or share your data with
            advertisers or data brokers.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Third-Party Services
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Supabase</strong> &mdash; database and authentication
              (your data is stored securely in their cloud infrastructure).
            </li>
            <li>
              <strong>Resend</strong> &mdash; transactional emails (welcome
              emails, grant alerts, password resets).
            </li>
            <li>
              <strong>Vercel</strong> &mdash; hosting and deployment.
            </li>
          </ul>
          <p className="mt-2">
            These services process data only as needed to operate GrantLink.
            None are advertising or analytics platforms.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Cookies
          </h2>
          <p>
            GrantLink uses only essential cookies for authentication (keeping
            you logged in). We do not use tracking, advertising, or analytics
            cookies.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Your Rights
          </h2>
          <ul className="list-disc space-y-1.5 pl-5">
            <li>
              <strong>Delete your account</strong> &mdash; you can permanently
              delete your account and all associated data from your dashboard
              settings.
            </li>
            <li>
              <strong>Unsubscribe</strong> &mdash; every email includes a
              one-click unsubscribe link.
            </li>
            <li>
              <strong>Export your data</strong> &mdash; contact us at{' '}
              <a
                href="mailto:grantlinkfeedback@gmail.com"
                className="text-primary hover:underline"
              >
                grantlinkfeedback@gmail.com
              </a>{' '}
              to request a copy of your data.
            </li>
          </ul>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Data Retention
          </h2>
          <p>
            We keep your data as long as your account is active. When you
            delete your account, all data is permanently removed from our
            systems.
          </p>
        </section>

        <section>
          <h2 className="mb-3 text-lg font-semibold text-foreground">
            Contact
          </h2>
          <p>
            Questions about privacy? Email us at{' '}
            <a
              href="mailto:grantlinkfeedback@gmail.com"
              className="text-primary hover:underline"
            >
              grantlinkfeedback@gmail.com
            </a>
            .
          </p>
        </section>
      </div>
    </div>
  )
}
