import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Search, ArrowLeft } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="container mx-auto flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-muted">
        <Search className="h-10 w-10 text-muted-foreground/40" />
      </div>
      <h1 className="mb-2 text-2xl font-bold text-foreground">Page Not Found</h1>
      <p className="mb-6 max-w-md text-muted-foreground">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
        Try searching for funding opportunities instead.
      </p>
      <div className="flex gap-3">
        <Button asChild variant="outline">
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Go Home
          </Link>
        </Button>
        <Button asChild>
          <Link href="/search">
            <Search className="mr-2 h-4 w-4" />
            Browse Opportunities
          </Link>
        </Button>
      </div>
    </div>
  )
}
