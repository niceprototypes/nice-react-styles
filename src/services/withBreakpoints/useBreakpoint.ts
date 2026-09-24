import { useSyncExternalStore } from "react"
import {
  BREAKPOINTS,
  BREAKPOINT_PHONE,
  SETTABLE_BREAKPOINTS,
  type BreakpointName,
} from "nice-styles"

/**
 * Compute the current viewport's breakpoint name from `window.innerWidth`.
 *
 * During SSR (no window), defaults to the phone breakpoint — matches the
 * phone-first philosophy used by the CSS layer.
 */
const getCurrent = (): BreakpointName => {
  if (typeof window === "undefined") return BREAKPOINT_PHONE
  const width = window.innerWidth
  // Widest settable floor the viewport reaches, checked largest first
  for (let i = SETTABLE_BREAKPOINTS.length - 1; i >= 0; i--) {
    if (width >= BREAKPOINTS[SETTABLE_BREAKPOINTS[i]]) return SETTABLE_BREAKPOINTS[i]
  }
  // Below the first settable floor is the phone base.
  return BREAKPOINT_PHONE
}

// Every useBreakpoint caller shares one window resize listener. It is attached
// when the first subscriber arrives and removed when the last one leaves.
const listeners = new Set<() => void>()

/** Notify every subscriber of a resize. */
const handleResize = (): void => {
  listeners.forEach((listener) => listener())
}

/**
 * Module-scope `useSyncExternalStore` subscribe — stable identity across all
 * callers. Exported for tests only; not part of the package API.
 *
 * @param onChange - Callback React passes per subscription
 * @returns Unsubscribe function
 */
export const subscribe = (onChange: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {}
  listeners.add(onChange)
  if (listeners.size === 1) window.addEventListener("resize", handleResize)
  return () => {
    listeners.delete(onChange)
    if (listeners.size === 0) window.removeEventListener("resize", handleResize)
  }
}

/**
 * Subscribes to viewport-width changes and returns the current breakpoint name.
 *
 * Uses `useSyncExternalStore` for tear-free reads and stable SSR output.
 * The server snapshot is always `BREAKPOINT_PHONE` — if the server rendered
 * at a larger breakpoint, the component re-renders on hydration.
 *
 * @returns The active breakpoint name — one of `BREAKPOINT_PHONE` /
 *   `BREAKPOINT_TABLET` / `BREAKPOINT_LAPTOP` / `BREAKPOINT_DESKTOP`.
 *
 * @example
 * import { useBreakpoint, BREAKPOINT_DESKTOP } from "nice-react-styles"
 *
 * const Component = () => {
 *   const bp = useBreakpoint()
 *   return <div>{bp === BREAKPOINT_DESKTOP ? "wide view" : "compact view"}</div>
 * }
 */
export const useBreakpoint = (): BreakpointName =>
  useSyncExternalStore(subscribe, getCurrent, () => BREAKPOINT_PHONE)