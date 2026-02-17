import type { ScrapedOpportunity } from './index'

/**
 * Parse a grants page HTML to extract opportunity data.
 * Uses heuristics + optional custom selectors from the funder's scrape_config.
 */
export async function parseGrantsPage(
  html: string,
  _url: string,
  config: { type?: string; selectors?: Record<string, string>; grants_page_url?: string } | null
): Promise<ScrapedOpportunity[]> {
  const opportunities: ScrapedOpportunity[] = []

  // Basic HTML text extraction (no DOM parser needed on server)
  const text = stripHtml(html)

  // Try to find grant/opportunity sections using common patterns
  const grantBlocks = extractGrantBlocks(html)

  for (const block of grantBlocks) {
    const opp = parseGrantBlock(block, config?.selectors)
    if (opp && opp.title) {
      opportunities.push(opp)
    }
  }

  // If no structured blocks found, try to extract from plain text patterns
  if (opportunities.length === 0) {
    const fallback = extractFromText(text, html)
    opportunities.push(...fallback)
  }

  return opportunities
}

/**
 * Strip HTML tags and decode entities.
 */
function stripHtml(html: string): string {
  return html
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

/**
 * Extract blocks that look like individual grant listings.
 * Looks for common HTML patterns used on grants pages.
 */
function extractGrantBlocks(html: string): string[] {
  const blocks: string[] = []

  // Pattern 1: article tags, cards, list items with grant-like content
  const patterns = [
    // Cards/articles with class names suggesting grants
    /<(?:article|div|section)[^>]*class="[^"]*(?:grant|opportunity|funding|program|award)[^"]*"[^>]*>([\s\S]*?)<\/(?:article|div|section)>/gi,
    // List items that contain grant keywords
    /<li[^>]*>([\s\S]*?)<\/li>/gi,
  ]

  for (const pattern of patterns) {
    let match
    while ((match = pattern.exec(html)) !== null) {
      const content = match[1] || match[0]
      // Only include if it looks like a grant listing
      if (looksLikeGrant(content)) {
        blocks.push(content)
      }
    }
  }

  return blocks
}

/**
 * Check if a block of HTML text looks like it describes a grant opportunity.
 */
function looksLikeGrant(text: string): boolean {
  const lower = text.toLowerCase()
  const grantKeywords = ['grant', 'funding', 'award', 'fellowship', 'prize', 'scholarship', 'application', 'deadline', 'eligible', 'apply']
  const matchCount = grantKeywords.filter(kw => lower.includes(kw)).length
  return matchCount >= 2
}

/**
 * Parse a single grant block into a ScrapedOpportunity.
 */
function parseGrantBlock(
  html: string,
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  _selectors?: Record<string, string>,
): ScrapedOpportunity | null {
  const text = stripHtml(html)

  // Extract title (first heading or strong text)
  const titleMatch = html.match(/<(?:h[1-6]|strong|b)[^>]*>(.*?)<\/(?:h[1-6]|strong|b)>/i)
  const title = titleMatch ? stripHtml(titleMatch[1]).trim() : null

  if (!title || title.length < 5 || title.length > 200) return null

  // Extract link
  const linkMatch = html.match(/<a[^>]*href="([^"]+)"[^>]*>/i)
  const applicationUrl = linkMatch ? linkMatch[1] : null

  // Extract amounts
  const amountDisplay = extractAmount(text)

  // Extract deadline
  const { deadlineDisplay, deadlineDate } = extractDeadline(text)

  // Determine status
  let status: ScrapedOpportunity['status'] = 'open'
  const lowerText = text.toLowerCase()
  if (lowerText.includes('closed') || lowerText.includes('no longer accepting')) {
    status = 'closed'
  } else if (lowerText.includes('coming soon') || lowerText.includes('upcoming')) {
    status = 'upcoming'
  }

  return {
    title,
    summary: extractSummary(text, title),
    amount_display: amountDisplay,
    deadline_display: deadlineDisplay,
    deadline_date: deadlineDate,
    application_url: applicationUrl,
    status,
    opportunity_type: 'grant',
    eligible_org_types: extractOrgTypes(text),
    eligible_geography: extractGeography(text),
    geo_scope_display: null,
  }
}

/**
 * Extract dollar amounts from text.
 */
function extractAmount(text: string): string | null {
  // Match patterns like $5,000, $100K, $1M, $10,000 - $50,000
  const amountPattern = /\$[\d,]+(?:\.\d+)?(?:\s*[KkMmBb](?:illion)?)?(?:\s*[-–]\s*\$[\d,]+(?:\.\d+)?(?:\s*[KkMmBb](?:illion)?)?)?/
  const match = text.match(amountPattern)
  return match ? match[0] : null
}

/**
 * Extract deadline info from text.
 */
function extractDeadline(text: string): { deadlineDisplay: string | null; deadlineDate: string | null } {
  // Look for date patterns near "deadline" keyword
  const datePatterns = [
    // "Deadline: March 15, 2026" or "Due: January 1, 2026"
    /(?:deadline|due|closes?|submit by)[:\s]*(\w+ \d{1,2},?\s*\d{4})/i,
    // ISO-ish dates
    /(?:deadline|due|closes?|submit by)[:\s]*(\d{4}-\d{2}-\d{2})/i,
    // "March 15, 2026"
    /(\b(?:January|February|March|April|May|June|July|August|September|October|November|December)\s+\d{1,2},?\s*\d{4})/i,
  ]

  for (const pattern of datePatterns) {
    const match = text.match(pattern)
    if (match) {
      const dateStr = match[1]
      try {
        const parsed = new Date(dateStr)
        if (!isNaN(parsed.getTime())) {
          return {
            deadlineDisplay: dateStr,
            deadlineDate: parsed.toISOString().split('T')[0],
          }
        }
      } catch {
        // ignore parsing errors
      }
      return { deadlineDisplay: dateStr, deadlineDate: null }
    }
  }

  if (text.toLowerCase().includes('rolling')) {
    return { deadlineDisplay: 'Rolling', deadlineDate: null }
  }

  return { deadlineDisplay: null, deadlineDate: null }
}

/**
 * Extract a summary from text.
 */
function extractSummary(text: string, title: string): string | null {
  // Remove title from text and take first ~200 chars
  const withoutTitle = text.replace(title, '').trim()
  if (withoutTitle.length < 20) return null

  const sentences = withoutTitle.split(/[.!?]+/).filter(s => s.trim().length > 10)
  if (sentences.length === 0) return null

  const summary = sentences.slice(0, 2).join('. ').trim()
  return summary.length > 300 ? summary.substring(0, 297) + '...' : summary + '.'
}

/**
 * Extract eligible org types from text.
 */
function extractOrgTypes(text: string): string[] {
  const types: string[] = []
  const lower = text.toLowerCase()

  if (lower.includes('501(c)(3)') || lower.includes('501c3') || lower.includes('nonprofit') || lower.includes('non-profit')) {
    types.push('501c3')
  }
  if (lower.includes('government') || lower.includes('public agenc')) {
    types.push('government')
  }
  if (lower.includes('individual') || lower.includes('person')) {
    types.push('individual')
  }
  if (lower.includes('fiscal sponsor')) {
    types.push('fiscal_sponsor')
  }

  return types.length > 0 ? types : ['501c3']
}

/**
 * Extract geography from text.
 */
function extractGeography(text: string): string[] {
  const lower = text.toLowerCase()

  if (lower.includes('global') || lower.includes('international') || lower.includes('worldwide')) {
    return ['Global']
  }
  if (lower.includes('united states') || lower.includes('u.s.') || lower.includes('domestic')) {
    return ['US']
  }

  return ['US']
}

/**
 * Fallback: extract opportunities from plain text using keyword heuristics.
 */
function extractFromText(text: string, html: string): ScrapedOpportunity[] {
  const opportunities: ScrapedOpportunity[] = []

  // Look for heading-like patterns followed by descriptive text
  const headingPattern = /<h[1-4][^>]*>(.*?)<\/h[1-4]>/gi
  let match

  while ((match = headingPattern.exec(html)) !== null) {
    const heading = stripHtml(match[1]).trim()
    if (heading.length < 5 || heading.length > 200) continue
    if (!looksLikeGrant(heading + ' ' + text.substring(0, 500))) continue

    // Get text after this heading until next heading
    const afterHeading = html.substring(match.index + match[0].length)
    const nextHeading = afterHeading.search(/<h[1-4]/i)
    const section = nextHeading > 0 ? afterHeading.substring(0, nextHeading) : afterHeading.substring(0, 1000)
    const sectionText = stripHtml(section)

    const amountDisplay = extractAmount(sectionText)
    const { deadlineDisplay, deadlineDate } = extractDeadline(sectionText)

    // Extract link
    const linkMatch = section.match(/<a[^>]*href="([^"]+)"[^>]*>/i)

    opportunities.push({
      title: heading,
      summary: extractSummary(sectionText, heading),
      amount_display: amountDisplay,
      deadline_display: deadlineDisplay,
      deadline_date: deadlineDate,
      application_url: linkMatch ? linkMatch[1] : null,
      status: 'open',
      opportunity_type: 'grant',
      eligible_org_types: extractOrgTypes(sectionText),
      eligible_geography: extractGeography(sectionText),
      geo_scope_display: null,
    })
  }

  return opportunities
}
