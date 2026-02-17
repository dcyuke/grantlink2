import { Suspense } from 'react'
import { SearchBar } from '@/components/search/search-bar'
import { FilterPanel } from '@/components/search/filter-panel'
import { FilterMobile } from '@/components/search/filter-mobile'
import { ActiveFilters } from '@/components/search/active-filters'
import { SortSelect } from '@/components/search/sort-select'
import { OrgProfilePanel } from '@/components/search/org-profile-panel'
import { SearchResultsWithFit } from '@/components/search/search-results-with-fit'
import { searchOpportunities } from '@/lib/data'
import { FileSearch } from 'lucide-react'
import Link from 'next/link'
import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Search Funding Opportunities',
  description:
    'Browse and filter thousands of grants, fellowships, prizes, and funding opportunities for nonprofits and social enterprises.',
}

interface SearchPageProps {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}

function parseParam(val: string | string[] | undefined): string | undefined {
  return Array.isArray(val) ? val[0] : val
}

export default async function SearchPage({ searchParams }: SearchPageProps) {
  const params = await searchParams

  const q = parseParam(params.q)
  const types = parseParam(params.types)?.split(',')
  const funderTypes = parseParam(params.funderTypes)?.split(',')
  const focusAreas = parseParam(params.focusAreas)?.split(',')
  const populations = parseParam(params.populations)?.split(',')
  const amountMin = parseParam(params.amountMin) ? Number(parseParam(params.amountMin)) : undefined
  const amountMax = parseParam(params.amountMax) ? Number(parseParam(params.amountMax)) : undefined
  const deadline = parseParam(params.deadline)
  const orgTypes = parseParam(params.orgTypes)?.split(',')
  const sort = parseParam(params.sort) || 'relevance'
  const page = parseParam(params.page) ? Number(parseParam(params.page)) : 1

  const { opportunities, totalCount, pageSize } = await searchOpportunities({
    q,
    types,
    funderTypes,
    focusAreas,
    populations,
    amountMin,
    amountMax,
    deadline,
    orgTypes,
    sort,
    page,
  })

  const totalPages = Math.ceil(totalCount / pageSize)

  return (
    <div className="container mx-auto px-4 py-6">
      {/* Search bar */}
      <Suspense fallback={null}>
        <SearchBar initialQuery={q} />
        <ActiveFilters />
      </Suspense>

      <div className="mt-6 flex gap-6">
        {/* Desktop filter sidebar */}
        <aside className="hidden w-64 shrink-0 lg:block">
          <div className="sticky top-20 space-y-4">
            {/* Org Profile Panel */}
            <OrgProfilePanel />

            {/* Filters */}
            <div className="rounded-xl border border-border/60 bg-card p-4 shadow-sm">
              <h2 className="mb-1 text-sm font-semibold text-foreground">Filters</h2>
              <Suspense fallback={null}>
                <FilterPanel />
              </Suspense>
            </div>
          </div>
        </aside>

        {/* Results area */}
        <div className="min-w-0 flex-1">
          {/* Results header */}
          <div className="mb-4 flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <Suspense fallback={null}>
                <FilterMobile />
              </Suspense>
              <p className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{totalCount.toLocaleString()}</span>{' '}
                {totalCount === 1 ? 'opportunity' : 'opportunities'} found
              </p>
            </div>
            <Suspense fallback={null}>
              <SortSelect />
            </Suspense>
          </div>

          {/* Results list */}
          {opportunities.length > 0 ? (
            <SearchResultsWithFit opportunities={opportunities} />
          ) : (
            <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-border py-16 text-center">
              <FileSearch className="mb-4 h-12 w-12 text-muted-foreground/40" />
              <h3 className="mb-1 text-lg font-semibold text-foreground">No opportunities found</h3>
              <p className="mb-4 max-w-sm text-sm text-muted-foreground">
                Try adjusting your filters or search terms to find more results.
              </p>
              <Link
                href="/search"
                className="text-sm font-medium text-primary transition-colors hover:text-primary/80"
              >
                Clear all filters
              </Link>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <Suspense fallback={null}>
              <Pagination currentPage={page} totalPages={totalPages} searchParams={params} />
            </Suspense>
          )}
        </div>
      </div>
    </div>
  )
}

function Pagination({
  currentPage,
  totalPages,
  searchParams,
}: {
  currentPage: number
  totalPages: number
  searchParams: { [key: string]: string | string[] | undefined }
}) {
  const buildPageUrl = (page: number) => {
    const params = new URLSearchParams()
    for (const [key, value] of Object.entries(searchParams)) {
      if (key !== 'page' && value) {
        params.set(key, Array.isArray(value) ? value[0] : value)
      }
    }
    if (page > 1) params.set('page', String(page))
    return `/search?${params.toString()}`
  }

  const pages: (number | '...')[] = []
  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)
    if (currentPage > 3) pages.push('...')
    for (let i = Math.max(2, currentPage - 1); i <= Math.min(totalPages - 1, currentPage + 1); i++) {
      pages.push(i)
    }
    if (currentPage < totalPages - 2) pages.push('...')
    pages.push(totalPages)
  }

  return (
    <nav className="mt-8 flex items-center justify-center gap-1">
      {currentPage > 1 && (
        <Link
          href={buildPageUrl(currentPage - 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          Previous
        </Link>
      )}
      {pages.map((p, i) =>
        p === '...' ? (
          <span key={`dots-${i}`} className="px-2 text-sm text-muted-foreground">
            ...
          </span>
        ) : (
          <Link
            key={p}
            href={buildPageUrl(p)}
            className={`rounded-lg px-3 py-1.5 text-sm font-medium transition-colors ${
              p === currentPage
                ? 'bg-primary text-primary-foreground'
                : 'text-muted-foreground hover:bg-muted'
            }`}
          >
            {p}
          </Link>
        )
      )}
      {currentPage < totalPages && (
        <Link
          href={buildPageUrl(currentPage + 1)}
          className="rounded-lg border border-border px-3 py-1.5 text-sm text-muted-foreground transition-colors hover:bg-muted"
        >
          Next
        </Link>
      )}
    </nav>
  )
}
