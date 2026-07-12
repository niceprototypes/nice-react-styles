/**
 * Device context for StylesProvider
 *
 * Lets StylesProvider optionally publish mobile detection through React context,
 * so consumers read a single shared device state with `useDevice()`. Detection
 * (internalized into StylesProvider) only runs when StylesProvider is given
 * `detectDevice` — otherwise `useDevice()` returns the inert default.
 */

import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import {
  useDeviceDetection,
  matchesMobileUserAgent,
  MOBILE_USER_AGENTS,
  DEVICE_DETECTION_DEFAULT,
  type DeviceDetectionState,
} from './useDeviceDetection'

/**
 * Shape returned by `useDevice()`.
 */
export interface DeviceState {
  /** Raw `navigator.userAgent` string (empty until an ancestor StylesProvider sets `detectDevice`). */
  userAgent: string
  /** The user-agent substrings `isMobile` was matched against — the default list, or the one passed to `useDevice`. */
  mobileUserAgents: readonly string[]
  /**
   * True when `userAgent` matches one of `mobileUserAgents`, OR when a
   * non-user-agent mobile signal fires (touch + small screen, or the
   * `?mobile=true` / `localStorage["debug-mobile"]` debug override). Always
   * false unless the enclosing StylesProvider has `detectDevice` set.
   */
  isMobile: boolean
}

// The provider publishes raw detection state; useDevice derives the public
// DeviceState from it so a per-call mobileUserAgents override is honored without
// re-running detection. Default context is the detection-off state.
const DeviceContext = createContext<DeviceDetectionState>(DEVICE_DETECTION_DEFAULT)

/**
 * Read the device state published by StylesProvider — `{ userAgent,
 * mobileUserAgents, isMobile }`.
 *
 * @param mobileUserAgents - Optional replacement for the default
 *   `MOBILE_USER_AGENTS` list. When provided, `isMobile` is recomputed against
 *   it (touch / small-screen / debug signals still apply). Returned verbatim as
 *   `mobileUserAgents`.
 *
 * Values are inert (`userAgent: ""`, `isMobile: false`) unless an ancestor
 * StylesProvider set `detectDevice`.
 */
export function useDevice(mobileUserAgents: readonly string[] = MOBILE_USER_AGENTS): DeviceState {
  const { userAgent, extrasMobile } = useContext(DeviceContext)
  // Recompute only when the detection inputs or the override list change.
  return useMemo<DeviceState>(
    () => ({
      userAgent,
      mobileUserAgents,
      isMobile: matchesMobileUserAgent(userAgent, mobileUserAgents) || extrasMobile,
    }),
    [userAgent, extrasMobile, mobileUserAgents]
  )
}

/**
 * Inner provider that actually runs detection. StylesProvider mounts it only
 * when `detectDevice` is set, so the resize listener + detection cost is paid
 * solely on opt-in. The hook is never called conditionally — this component
 * either mounts whole or not at all, satisfying the rules of hooks.
 */
export function DeviceDetectionProvider({ children }: { children: ReactNode }) {
  // useDeviceDetection already returns a stable reference until the state flips,
  // so descendants don't re-render on unrelated StylesProvider renders.
  const state = useDeviceDetection()
  return <DeviceContext.Provider value={state}>{children}</DeviceContext.Provider>
}
