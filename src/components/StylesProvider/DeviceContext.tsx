/**
 * Device context for StylesProvider
 *
 * Lets StylesProvider optionally publish device detection (via
 * nice-react-device-detector) through React context, so consumers read a single
 * shared `isMobile` with `useDevice()` instead of wiring a separate
 * DeviceProvider. Detection only runs when StylesProvider is given
 * `detectDevice` — otherwise `useDevice()` returns the inert default.
 */

import { createContext, useContext, useMemo } from 'react'
import type { ReactNode } from 'react'
import { useDeviceDetector } from 'nice-react-device-detector'

/**
 * Shape returned by `useDevice()`.
 */
export interface DeviceContextValue {
  /**
   * True when the viewport / user-agent is detected as mobile. Always false
   * unless the enclosing StylesProvider has `detectDevice` set.
   */
  isMobile: boolean
}

// Detection-off default — a StylesProvider without `detectDevice` (or no
// provider at all) leaves useDevice() consumers reading false rather than
// throwing. Stable reference so it never triggers a re-render.
const DEVICE_DEFAULT: DeviceContextValue = { isMobile: false }

const DeviceContext = createContext<DeviceContextValue>(DEVICE_DEFAULT)

/**
 * Read the device state published by StylesProvider — `{ isMobile }`.
 *
 * `isMobile` is false unless an ancestor StylesProvider set `detectDevice`.
 * Replaces a direct `useDevice` from nice-react-device-detector when the app
 * lets StylesProvider own detection.
 */
export function useDevice(): DeviceContextValue {
  return useContext(DeviceContext)
}

/**
 * Inner provider that actually runs detection. StylesProvider mounts it only
 * when `detectDevice` is set, so the resize listener + detection cost is paid
 * solely on opt-in. The hook is never called conditionally — this component
 * either mounts whole or not at all, satisfying the rules of hooks.
 */
export function DeviceDetectionProvider({ children }: { children: ReactNode }) {
  const isMobile = useDeviceDetector()
  // Recompute the context value only when isMobile flips, so descendants don't
  // re-render on unrelated StylesProvider renders.
  const value = useMemo<DeviceContextValue>(() => ({ isMobile }), [isMobile])
  return <DeviceContext.Provider value={value}>{children}</DeviceContext.Provider>
}