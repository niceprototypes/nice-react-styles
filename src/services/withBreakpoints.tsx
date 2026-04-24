import * as React from "react"
import {
  BREAKPOINT_SMALL,
  BREAKPOINT_MEDIUM,
  BREAKPOINT_LARGE,
  type BreakpointName,
} from "nice-styles"
import { useBreakpoint } from "./useBreakpoint"

/**
 * A single entry in the `breakpoints` prop array.
 *
 * At least one of `min` or `max` must be defined — a runtime guard throws if
 * both are missing. TypeScript enforces the same via the union.
 *
 * - `min` (inclusive): override activates when the current breakpoint is this
 *   name or wider.
 * - `max` (inclusive): override activates when the current breakpoint is this
 *   name or narrower.
 * - Providing both scopes the override to a range (e.g. medium-only).
 */
export type BreakpointOverride<P> =
  | { min: BreakpointName; max?: BreakpointName; props: Partial<P> }
  | { min?: BreakpointName; max: BreakpointName; props: Partial<P> }

/**
 * Props shape returned by `withBreakpoints(Component)` — the original props
 * plus an optional `breakpoints` array of per-breakpoint overrides.
 */
export type WithBreakpointsProps<P> = P & {
  breakpoints?: BreakpointOverride<P>[]
}

/**
 * Monotonic ordering of the three breakpoint names. Consumer code never
 * reads this map directly — it is used by `matches()` below.
 */
const BREAKPOINT_ORDER: Record<BreakpointName, number> = {
  [BREAKPOINT_SMALL]: 0,
  [BREAKPOINT_MEDIUM]: 1,
  [BREAKPOINT_LARGE]: 2,
}

const matches = (
  current: BreakpointName,
  min: BreakpointName | undefined,
  max: BreakpointName | undefined
): boolean => {
  const c = BREAKPOINT_ORDER[current]
  if (min !== undefined && c < BREAKPOINT_ORDER[min]) return false
  if (max !== undefined && c > BREAKPOINT_ORDER[max]) return false
  return true
}

/**
 * Wraps a component with a generic `breakpoints` prop that accepts an array
 * of `{ min?, max?, props }` overrides. At render time, any entry whose
 * min/max window covers the current breakpoint has its `props` merged over
 * the base props. Later matching entries win over earlier ones.
 *
 * Because overrides are typed as `Partial<P>`, every prop the component
 * already accepts — and any prop ever added to it later — is automatically
 * responsive without per-prop plumbing.
 *
 * @example
 * const ResponsiveTile = withBreakpoints(Tile)
 *
 * <ResponsiveTile
 *   spacing="base"
 *   maxWidthLarge={800}
 *   breakpoints={[
 *     { min: BREAKPOINT_MEDIUM, max: BREAKPOINT_MEDIUM, props: { spacing: "large" } },
 *     { min: BREAKPOINT_LARGE, props: { spacing: "larger", maxWidthLarge: 1200 } },
 *   ]}
 * >
 *   ...
 * </ResponsiveTile>
 */
export function withBreakpoints<P extends object>(
  Component: React.ComponentType<P>
): React.FC<WithBreakpointsProps<P>> {
  const Wrapped: React.FC<WithBreakpointsProps<P>> = (allProps) => {
    const { breakpoints, ...base } = allProps as WithBreakpointsProps<P> & { breakpoints?: BreakpointOverride<P>[] }
    const current = useBreakpoint()

    // Runtime guard — each entry must define at least one bound
    const overrides: Partial<P> = {}
    for (const entry of breakpoints ?? []) {
      if (entry.min === undefined && entry.max === undefined) {
        throw new Error(
          "withBreakpoints: each entry in the `breakpoints` array must define `min`, `max`, or both."
        )
      }
      if (matches(current, entry.min, entry.max)) {
        Object.assign(overrides, entry.props)
      }
    }

    return <Component {...(base as unknown as P)} {...overrides} />
  }
  Wrapped.displayName = `withBreakpoints(${Component.displayName ?? Component.name ?? "Component"})`
  return Wrapped
}
