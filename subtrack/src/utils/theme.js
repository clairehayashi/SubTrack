import { useState, useEffect } from 'react'

const STORAGE_KEY = 'subtrack-theme'
const EVENT_NAME  = 'subtrack-theme-changed'

export function getInitialTheme() {
  if (typeof window === 'undefined') return 'light'
  const stored = localStorage.getItem(STORAGE_KEY)
  if (stored === 'light' || stored === 'dark') return stored
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem(STORAGE_KEY, theme)
  window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: theme }))
}

export function useTheme() {
  const [theme, setTheme] = useState(() => getInitialTheme())

  useEffect(() => {
    const handler = (e) => setTheme(e.detail)
    window.addEventListener(EVENT_NAME, handler)
    return () => window.removeEventListener(EVENT_NAME, handler)
  }, [])

  const toggle = () => applyTheme(theme === 'dark' ? 'light' : 'dark')

  return { theme, toggle, setTheme: applyTheme }
}