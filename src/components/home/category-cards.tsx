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
    <section className="py-20">
      <div className="container mx-auto px-4">
        <div className="mb-10 text-center">
          <h2 className="font-serif text-2xl font-bold text-foreground md:text-3xl">
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
                className="group flex flex-col items-center gap-3 rounded-lg border border-border/30 bg-card p-5 text-center transition-all duration-300 hover:border-primary/20 hover:shadow-sm"
              >
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-primary/[0.07] transition-colors group-hover:bg-primary/[0.12]">
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
