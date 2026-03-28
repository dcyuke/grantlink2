import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'GrantLink - Grants, Impact Data, Readiness Tools, and More'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f0f7f1 0%, #e8f0e9 50%, #dce8dd 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          fontFamily: 'Georgia, serif',
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'baseline',
            fontSize: 72,
            fontWeight: 700,
            letterSpacing: '-1px',
          }}
        >
          <span style={{ color: '#1a1a1a' }}>Grant</span>
          <span style={{ color: '#5C7C5E' }}>Link</span>
        </div>
        <div
          style={{
            fontSize: 28,
            color: '#666',
            marginTop: 16,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Grants, impact data, readiness tools, and more.
        </div>
        <div
          style={{
            fontSize: 18,
            color: '#999',
            marginTop: 12,
            fontFamily: 'system-ui, sans-serif',
          }}
        >
          Built for small and mid-sized nonprofits
        </div>
      </div>
    ),
    { ...size }
  )
}
