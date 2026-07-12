import { useEffect, useState } from 'react'

/**
 * Internal mobile detection for StylesProvider. Not part of the public API;
 * consumers read the shared result through `useDevice()`.
 */

/**
 * Default substrings matched (case-insensitively) against `navigator.userAgent`
 * to flag a mobile device. Joined with `|` into one RegExp. Exposed as the
 * default for `useDevice(mobileUserAgents?)` — pass a replacement list to that
 * hook to override it per call.
 */
export const MOBILE_USER_AGENTS: readonly string[] = [
  'Android',
  'BlackBerry',
  'iPhone',
  'iPad',
  'iPod',
  'Opera Mini',
  'IEMobile',
  'WPDesktop',
  'Mobile',
  'mobile',
]

/**
 * Viewport width (px) at/below which a touch device counts as mobile. Aligned
 * with the nice-styles phone band ceiling, so `isMobile` and the phone
 * breakpoint map 1:1.
 */
const MOBILE_MAX_WIDTH = 640

/**
 * Detection state published on DeviceContext by `DeviceDetectionProvider`.
 * `userAgent` is the raw UA string; `extrasMobile` is the non-user-agent mobile
 * signal (debug override, or touch + small screen) that `useDevice` ORs with a
 * user-agent match so overriding the UA list can never suppress those triggers.
 */
export interface DeviceDetectionState {
  userAgent: string
  extrasMobile: boolean
}

/** Detection-off default — an empty UA and no extra mobile signal. */
export const DEVICE_DETECTION_DEFAULT: DeviceDetectionState = {
  userAgent: '',
  extrasMobile: false,
}

/**
 * True when `userAgent` contains any entry of `mobileUserAgents` (matched
 * case-insensitively). Empty UA or empty list can never match.
 */
export function matchesMobileUserAgent(
  userAgent: string,
  mobileUserAgents: readonly string[]
): boolean {
  if (!userAgent || mobileUserAgents.length === 0) return false
  return new RegExp(mobileUserAgents.join('|'), 'i').test(userAgent)
}

/** Read the current UA string, SSR-safe (`''` when there is no navigator). */
function readUserAgent(): string {
  if (typeof window === 'undefined' || typeof window.navigator === 'undefined') return ''
  return navigator.userAgent
}

/**
 * Non-user-agent mobile signal: the debug overrides (`?mobile=true` query param
 * or `localStorage["debug-mobile"] === "true"`, checked first), or a touch
 * device on a small screen (which also catches Chrome DevTools mobile
 * emulation). Kept separate from the UA match so a caller-supplied
 * `mobileUserAgents` list overrides only the UA dimension, never these.
 */
function detectExtrasMobile(): boolean {
  if (typeof window === 'undefined') return false

  // Debug override forces mobile regardless of UA — dev/testing escape hatch.
  const debugMobile =
    localStorage.getItem('debug-mobile') === 'true' ||
    new URLSearchParams(window.location.search).get('mobile') === 'true'
  if (debugMobile) return true

  const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0
  const smallScreen = window.innerWidth <= MOBILE_MAX_WIDTH
  return hasTouch && smallScreen
}

/**
 * Run mobile detection and keep it current across resize / orientation /
 * DevTools-emulation changes. Mounted by `StylesProvider` only when
 * `detectDevice` is set (via `DeviceDetectionProvider`), so it is never called
 * conditionally and the resize listener is paid for solely on opt-in. SSR-safe:
 * detection runs in an effect, so the server snapshot is the inert default.
 */
export function useDeviceDetection(): DeviceDetectionState {
  const [state, setState] = useState<DeviceDetectionState>(DEVICE_DETECTION_DEFAULT)

  useEffect(() => {
    const update = () => {
      const next: DeviceDetectionState = {
        userAgent: readUserAgent(),
        extrasMobile: detectExtrasMobile(),
      }
      // Bail if nothing changed so descendants don't re-render on every resize
      // event — preserves the "recompute only when the value flips" behavior.
      setState((prev) =>
        prev.userAgent === next.userAgent && prev.extrasMobile === next.extrasMobile
          ? prev
          : next
      )
    }
    update() // initial detection on mount (client-only)
    window.addEventListener('resize', update)
    return () => window.removeEventListener('resize', update)
  }, [])

  return state
}