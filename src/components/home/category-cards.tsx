import Link from 'next/link'
import {
  GraduationCap, Heart, Leaf, Palette, TrendingUp, Scale,
  Users, Home, Wheat, Cpu, Globe, Brain, Briefcase, Building,
  Shield, Newspaper, Microscope,
} from 'lucide-react'

const ICON_MAP: Record<string, React.ComponentType<{ className?: string }>> = {
  GraduationCap, Heart, Leaf, Palette, TrendingUp, Scale,
  Users, Home, Wheat, Cpu, Globe, Brain, Briefcase, Building,
  Shield, Newspaper, Microscope,
}

interface CategoryCardsProps {
  categories: { slug: string; name: string; icon: string | null }[]
}

export function CategoryCards({ categories }: CategoryCardsProps) {
  return (
    <section className="py-24">
      <div className="container mx-auto px-4">
        <div className="mb-12 text-center">
          <p className="mb-3 text-sm font-medium tracking-widest uppercase text-muted-foreground/60">
            Focus Areas
          </p>
          <h2 className="font-serif text-3xl font-extrabold text-foreground md:text-4xl">
            Browse by Focus Area
          </h2>
          <p className="mx-auto mt-3 max-w-md text-muted-foreground">
            Find opportunities sized right for your nonprofit
          </p>
        </div>

        <div className="mx-auto grid max-w-5xl grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((cat) => {
            const Icon = cat.icon ? ICON_MAP[cat.icon] : Globe
            return (
              <Link
                key={cat.slug}
                href={`/grants-for/${cat.slug}`}
                className="group flex flex-col items-center gap-3 rounded-2xl border border-border/50 bg-card p-5 text-center transition-all duration-300 hover:border-primary/25 hover:shadow-md hover:shadow-primary/5 hover:-translate-y-0.5"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-muted transition-colors group-hover:bg-primary/10">
                  {Icon && <Icon className="h-5 w-5 text-foreground/60 transition-colors group-hover:text-primary" />}
                </div>
                <span className="text-sm font-medium text-foreground">{cat.name}</span>
              </Link>
            )
          })}
        </div>
      </div>
    </section>
  )
}
