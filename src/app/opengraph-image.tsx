import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const alt = 'GrantLink — Grants, Impact Data, Readiness Tools, and More'
export const size = { width: 1200, height: 630 }
export const contentType = 'image/png'

export default function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 40%, #f0fdf4 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
          position: 'relative',
        }}
      >
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: -120,
            left: -120,
            width: 480,
            height: 480,
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.12)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: -80,
            right: -80,
            width: 360,
            height: 360,
            borderRadius: '50%',
            background: 'rgba(34, 197, 94, 0.08)',
          }}
        />

        {/* Wordmark */}
        <div style={{ display: 'flex', alignItems: 'baseline', marginBottom: 36 }}>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 56, fontWeight: 700, color: '#14532d', letterSpacing: '-1px' }}>
            Grant
          </span>
          <span style={{ fontFamily: 'Georgia, serif', fontSize: 56, fontWeight: 700, color: '#16a34a', letterSpacing: '-1px' }}>
            Link
          </span>
        </div>

        {/* Headline */}
        <div
          style={{
            fontFamily: 'Georgia, serif',
            fontSize: 44,
            fontWeight: 700,
            color: '#14532d',
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: 800,
            marginBottom: 24,
          }}
        >
          Your Mission. One Platform.
        </div>

        {/* Subtitle */}
        <div
          style={{
            fontFamily: 'system-ui, sans-serif',
            fontSize: 22,
            color: '#4b7a4e',
            textAlign: 'center',
            maxWidth: 680,
            lineHeight: 1.5,
            marginBottom: 48,
          }}
        >
          Find the right grants, measure your impact, and build the case funders want to see.
        </div>

        {/* Feature pills */}
        <div style={{ display: 'flex', gap: 16 }}>
          {['Grant Search', 'Impact Tools', 'Readiness Assessment'].map((label) => (
            <div
              key={label}
              style={{
                background: 'rgba(22, 163, 74, 0.10)',
                border: '1.5px solid rgba(22, 163, 74, 0.28)',
                borderRadius: 100,
                padding: '10px 24px',
                fontSize: 16,
                fontWeight: 600,
                color: '#16a34a',
                fontFamily: 'system-ui, sans-serif',
              }}
            >
              {label}
            </div>
          ))}
        </div>

        {/* URL */}
        <div
          style={{
            position: 'absolute',
            bottom: 44,
            fontFamily: 'system-ui, sans-serif',
            fontSize: 18,
            color: '#6b9b6e',
            fontWeight: 500,
          }}
        >
          grantlink.org
        </div>
      </div>
    ),
    { ...size }
  )
}
