import { useSyncExternalStore } from "react"
import {
  BREAKPOINTS,
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
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
  if (width >= BREAKPOINTS[BREAKPOINT_DESKTOP]) return BREAKPOINT_DESKTOP
  if (width >= BREAKPOINTS[BREAKPOINT_LAPTOP]) return BREAKPOINT_LAPTOP
  if (width > BREAKPOINTS[BREAKPOINT_PHONE]) return BREAKPOINT_TABLET
  return BREAKPOINT_PHONE
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