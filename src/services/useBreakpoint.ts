import { useSyncExternalStore } from "react"
import {
  BREAKPOINTS,
  BREAKPOINT_SMALL,
  BREAKPOINT_MEDIUM,
  BREAKPOINT_LARGE,
  type BreakpointName,
} from "nice-styles"

/**
 * Compute the current viewport's breakpoint name from `window.innerWidth`.
 *
 * During SSR (no window), defaults to the small breakpoint — matches the
 * small-first philosophy used by the CSS layer.
 */
const getCurrent = (): BreakpointName => {
  if (typeof window === "undefined") return BREAKPOINT_SMALL
  const width = window.innerWidth
  if (width >= BREAKPOINTS[BREAKPOINT_LARGE]) return BREAKPOINT_LARGE
  if (width > BREAKPOINTS[BREAKPOINT_SMALL]) return BREAKPOINT_MEDIUM
  return BREAKPOINT_SMALL
}

const subscribe = (onChange: () => void): (() => void) => {
  if (typeof window === "undefined") return () => {}
  window.addEventListener("resize", onChange)
  return () => window.removeEventListener("resize", onChange)
}

/**
 * Subscribes to viewport-width changes and returns the current breakpoint name.
 *
 * Uses `useSyncExternalStore` for tear-free reads and stable SSR output.
 * The server snapshot is always `BREAKPOINT_SMALL` — if the server rendered
 * at a larger breakpoint, the component re-renders on hydration.
 *
 * @returns The active breakpoint name — one of `BREAKPOINT_SMALL` /
 *   `BREAKPOINT_MEDIUM` / `BREAKPOINT_LARGE`.
 *
 * @example
 * import { useBreakpoint, BREAKPOINT_LARGE } from "nice-react-styles"
 *
 * const Component = () => {
 *   const bp = useBreakpoint()
 *   return <div>{bp === BREAKPOINT_LARGE ? "desktop view" : "compact view"}</div>
 * }
 */
export const useBreakpoint = (): BreakpointName =>
  useSyncExternalStore(subscribe, getCurrent, () => BREAKPOINT_SMALL)
