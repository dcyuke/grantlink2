/**
 * PageTint — Decorative gradient wash at the top of a page.
 *
 * Renders an absolute-positioned gradient that fades from a tinted color
 * to transparent. Must be inside a `relative` container.
 */

interface PageTintProps {
  /** OKLCH color with alpha, e.g. "oklch(0.52 0.08 145 / 0.06)" */
  color: string
}

export function PageTint({ color }: PageTintProps) {
  return (
    <div
      aria-hidden
      className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[500px]"
      style={{
        background: `linear-gradient(to bottom, ${color}, transparent)`,
      }}
    />
  )
}
