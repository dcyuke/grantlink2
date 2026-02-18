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
    <section className="bg-muted/20 py-16">
      <div className="container mx-auto px-4">
        <div className="mb-8 text-center">
          <h2 className="text-2xl font-bold text-foreground md:text-3xl">
            Browse by Focus Area
          </h2>
          <p className="mt-1 text-muted-foreground">
            Find opportunities aligned with your mission
          </p>
        </div>

        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
          {categories.map((cat) => {
            const Icon = cat.icon ? ICON_MAP[cat.icon] : Globe
            return (
              <Link
                key={cat.slug}
                href={`/grants-for/${cat.slug}`}
                className="group flex flex-col items-center gap-2.5 rounded-xl border border-border/60 bg-card p-4 text-center transition-all duration-200 hover:border-primary/30 hover:shadow-md"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 transition-colors group-hover:bg-primary/20">
                  {Icon && <Icon className="h-5 w-5 text-primary" />}
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
