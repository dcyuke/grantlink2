'use client'

import { useSyncExternalStore } from 'react'
import { Moon, Sun } from 'lucide-react'

function getSnapshot() {
  return document.documentElement.classList.contains('dark')
}
function getServerSnapshot() {
  return false
}
function subscribe(cb: () => void) {
  const observer = new MutationObserver(cb)
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] })
  return () => observer.disconnect()
}

// Apply theme before React hydrates to avoid flash
if (typeof window !== 'undefined') {
  const stored = localStorage.getItem('grantlink-theme')
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
  const isDark = stored === 'dark' || (!stored && prefersDark)
  document.documentElement.classList.toggle('dark', isDark)
}

export function ThemeToggle() {
  const dark = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot)

  const toggle = () => {
    const next = !dark
    document.documentElement.classList.toggle('dark', next)
    localStorage.setItem('grantlink-theme', next ? 'dark' : 'light')
  }

  return (
    <button
      onClick={toggle}
      className="inline-flex h-8 w-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-primary/5 hover:text-foreground"
      aria-label="Toggle theme"
    >
      {dark ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
    </button>
  )
}
