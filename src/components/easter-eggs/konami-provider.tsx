'use client'

import { useEffect, useRef, useState } from 'react'

const KONAMI = [
  'ArrowUp', 'ArrowUp', 'ArrowDown', 'ArrowDown',
  'ArrowLeft', 'ArrowRight', 'ArrowLeft', 'ArrowRight',
  'KeyB', 'KeyA',
]

const RAIN_ITEMS = ['$', '\u2728', '$', '\u2728', '$', '\u2728', '$', '$', '\u2728', '$',
  '$', '\u2728', '$', '\u2728', '$', '$', '\u2728', '$', '\u2728', '$',
  '$', '\u2728', '$', '$', '\u2728']

export function KonamiProvider({ children }: { children: React.ReactNode }) {
  const [triggered, setTriggered] = useState(false)
  const sequence = useRef<string[]>([])

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      sequence.current.push(e.code)
      sequence.current = sequence.current.slice(-10)
      if (sequence.current.join(',') === KONAMI.join(',')) {
        setTriggered(true)
        sequence.current = []
        setTimeout(() => setTriggered(false), 4000)
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [])

  return (
    <>
      {children}
      {triggered && <GrantRain />}
    </>
  )
}

function GrantRain() {
  return (
    <div className="pointer-events-none fixed inset-0 z-[9999] overflow-hidden">
      {/* Toast message */}
      <div className="absolute left-1/2 top-8 -translate-x-1/2 animate-[success-pop_0.5s_ease-out] rounded-full border border-primary/20 bg-card px-6 py-2.5 shadow-lg">
        <p className="whitespace-nowrap text-sm font-medium text-primary">
          May your next grant application be blessed
        </p>
      </div>
      {/* Falling items */}
      {RAIN_ITEMS.map((item, i) => (
        <span
          key={i}
          className="absolute text-2xl"
          style={{
            left: `${4 + (i * 3.8) % 92}%`,
            animationName: 'grant-rain',
            animationDuration: `${2 + Math.random() * 1.5}s`,
            animationTimingFunction: 'linear',
            animationFillMode: 'forwards',
            animationDelay: `${i * 80}ms`,
          }}
        >
          {item}
        </span>
      ))}
    </div>
  )
}
