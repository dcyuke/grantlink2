import { Building2, Search, BarChart3, FileText } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

const STEPS = [
  {
    num: '01',
    icon: Building2,
    title: 'Set Up Your Profile',
    description:
      'Tell us about your nonprofit — mission, focus areas, budget — and every tool becomes personalized to your work.',
  },
  {
    num: '02',
    icon: Search,
    title: 'Find & Track Funding',
    description:
      'Search thousands of grants, fellowships, and prizes. Save, compare, and track applications from research to award.',
  },
  {
    num: '03',
    icon: BarChart3,
    title: 'Measure Your Impact',
    description:
      'Choose from 20 issue-area frameworks. Enter data, track trends over time, and see your progress at a glance.',
  },
  {
    num: '04',
    icon: FileText,
    title: 'Report to Stakeholders',
    description:
      'Generate polished donor updates, board presentations, and grant reports — ready to share or print.',
  },
]

export function HowItWorks() {
  return (
    <section className="container mx-auto px-4 py-24">
      <div className="mx-auto max-w-5xl">
        <div className="mb-16 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest uppercase text-muted-foreground/60">
            How-to
          </p>
          <h2 className="font-serif text-3xl font-bold text-foreground md:text-4xl">
            How GrantLink Works
          </h2>
          <p className="mx-auto mt-3 max-w-lg text-muted-foreground">
            From setup to reporting — a connected workflow for your whole team.
          </p>
        </div>

        {/* Steps — numbered list with descriptions */}
        <div className="grid gap-0 md:grid-cols-2">
          <div className="flex flex-col">
            {STEPS.map((step) => (
              <div key={step.num} className="flex gap-5 border-t border-border py-6">
                <span className="text-sm font-medium tabular-nums text-muted-foreground/50">{step.num}</span>
                <div>
                  <h3 className="mb-1 font-medium text-foreground">{step.title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">{step.description}</p>
                </div>
              </div>
            ))}
            <div className="pt-4">
              <Button asChild className="rounded-full px-6" variant="default">
                <Link href="/organization">Get Started</Link>
              </Button>
            </div>
          </div>

          {/* Right side — image */}
          <div className="hidden items-center justify-center md:flex">
            <div className="overflow-hidden rounded-3xl">
              <Image
                src="https://images.unsplash.com/photo-1517245386807-bb43f82c33c4?w=800&q=80"
                alt="Team collaboration and planning"
                width={800}
                height={600}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
