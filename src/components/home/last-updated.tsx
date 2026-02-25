interface LastUpdatedProps {
  lastUpdated: string | null
}

export function LastUpdated({ lastUpdated }: LastUpdatedProps) {
  if (!lastUpdated) return null

  const date = new Date(lastUpdated)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  let timeAgo: string
  if (diffHours < 1) {
    timeAgo = 'less than an hour ago'
  } else if (diffHours < 24) {
    timeAgo = `${diffHours} hour${diffHours === 1 ? '' : 's'} ago`
  } else {
    timeAgo = `${diffDays} day${diffDays === 1 ? '' : 's'} ago`
  }

  return (
    <div className="border-t border-border/40 py-4 text-center">
      <p className="text-xs text-muted-foreground">
        Database last updated {timeAgo} · Updated daily at 6:00 AM EST
      </p>
    </div>
  )
}
