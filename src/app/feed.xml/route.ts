import { getAllOpportunities } from '@/lib/data'

function escapeXml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;')
}

export async function GET() {
  const all = await getAllOpportunities()

  // Sort by created_at descending (newest first), take top 50
  const recent = [...all]
    .sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0
      return dateB - dateA
    })
    .slice(0, 50)

  const lastUpdated = recent[0]?.created_at
    ? new Date(recent[0].created_at).toISOString()
    : new Date().toISOString()

  const entries = recent
    .map((opp) => {
      const updated = opp.created_at
        ? new Date(opp.created_at).toISOString()
        : new Date().toISOString()
      const summary = opp.summary || opp.title
      const author = opp.funder_name || 'Unknown Funder'

      return `  <entry>
    <title>${escapeXml(opp.title)}</title>
    <link href="https://grantlink.org/opportunity/${escapeXml(opp.slug)}"/>
    <id>https://grantlink.org/opportunity/${escapeXml(opp.slug)}</id>
    <updated>${updated}</updated>
    <summary>${escapeXml(summary)}</summary>
    <category term="${escapeXml(opp.opportunity_type)}"/>
    <author><name>${escapeXml(author)}</name></author>
  </entry>`
    })
    .join('\n')

  const feed = `<?xml version="1.0" encoding="utf-8"?>
<feed xmlns="http://www.w3.org/2005/Atom">
  <title>GrantLink - New Funding Opportunities</title>
  <subtitle>Recently added grants, fellowships, and funding opportunities for nonprofits</subtitle>
  <link href="https://grantlink.org/feed.xml" rel="self"/>
  <link href="https://grantlink.org"/>
  <id>https://grantlink.org/</id>
  <updated>${lastUpdated}</updated>
${entries}
</feed>`

  return new Response(feed, {
    headers: {
      'Content-Type': 'application/atom+xml; charset=utf-8',
      'Cache-Control': 'public, s-maxage=3600, stale-while-revalidate=7200',
    },
  })
}
