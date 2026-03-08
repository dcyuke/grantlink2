/**
 * Safely serialize JSON-LD structured data for injection into <script> tags.
 *
 * JSON.stringify alone is not safe because a value containing "</script>"
 * could break out of the script block and inject arbitrary HTML.
 * This function escapes the `<` character to prevent that attack.
 */
export function safeJsonLd(data: Record<string, unknown>): string {
  return JSON.stringify(data).replace(/</g, '\\u003c')
}
