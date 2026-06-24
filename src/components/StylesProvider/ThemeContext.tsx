/**
 * Theme context for StylesProvider
 *
 * The theme sibling of DeviceContext. Lets StylesProvider optionally detect the
 * OS color-scheme preference and publish it through React context, so consumers
 * read a single shared `isNight` with `useTheme()` the same way they read
 * `isMobile` with `useDevice()`. Detection only runs when StylesProvider is
 * given `detectTheme`.
 */

import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { DEFAULT_THEME, type ThemeType } from 'nice-styles'

/**
 * Shape returned by `useTheme()`.
 */
export interface ThemeContextValue {
  /**
   * The detected theme name (`ThemeType` — `"day"`, `"night"`, or a custom
   * theme). Returns `DEFAULT_THEME` unless the enclosing StylesProvider has
   * `detectTheme` set.
   *
   * Reflects the system preference / default cascade — not an explicit `<Theme>`
   * pin you apply yourself (that is a deliberate override, the theme equivalent
   * of forcing a device state). Returns a name rather than a boolean so more
   * themes can be added without a breaking signature change — branch on
   * `theme === "night"` rather than a `isNight` flag.
   */
  theme: ThemeType
}

// Detection-off default — a StylesProvider without `detectTheme` (or no provider
// at all) leaves useTheme() consumers reading DEFAULT_THEME rather than throwing.
// Stable reference so it never triggers a re-render.
const THEME_DEFAULT: ThemeContextValue = { theme: DEFAULT_THEME }

const ThemeContext = createContext<ThemeContextValue>(THEME_DEFAULT)

/**
 * Read the theme state published by StylesProvider — `{ theme }`.
 *
 * The theme sibling of `useDevice()`. `theme` is `DEFAULT_THEME` unless an
 * ancestor StylesProvider set `detectTheme`.
 */
export function useTheme(): ThemeContextValue {
  return useContext(ThemeContext)
}

const DARK_QUERY = '(prefers-color-scheme: dark)'

/**
 * Tracks the OS color-scheme preference and maps it to a theme name, reactive to
 * changes. SSR-safe — returns DEFAULT_THEME until mounted in the browser.
 * Mirrors the device detector's listener pattern: subscribe on mount,
 * unsubscribe on unmount.
 */
function usePreferredTheme(): ThemeType {
  const read = (): ThemeType =>
    typeof window !== 'undefined' &&
    typeof window.matchMedia === 'function' &&
    window.matchMedia(DARK_QUERY).matches
      ? 'night'
      : DEFAULT_THEME
  const [theme, setTheme] = useState<ThemeType>(read)
  useEffect(() => {
    const mq = window.matchMedia(DARK_QUERY)
    const handler = (e: MediaQueryListEvent) =>
      setTheme(e.matches ? 'night' : DEFAULT_THEME)
    // Re-sync on mount in case the preference flipped before the listener attached.
    setTheme(mq.matches ? 'night' : DEFAULT_THEME)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return theme
}

/**
 * Inner provider that actually runs theme detection. StylesProvider mounts it
 * only when `detectTheme` is set, so the prefers-color-scheme listener is
 * registered solely on opt-in. The hook is never called conditionally — this
 * component either mounts whole or not at all, satisfying the rules of hooks.
 */
export function ThemeDetectionProvider({ children }: { children: ReactNode }) {
  const theme = usePreferredTheme()
  // Recompute the context value only when theme changes, so descendants don't
  // re-render on unrelated StylesProvider renders.
  const value = useMemo<ThemeContextValue>(() => ({ theme }), [theme])
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}