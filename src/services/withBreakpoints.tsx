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
 * both are missing.
 *
 * - `min` (inclusive): entry activates when the current breakpoint is this
 *   name or wider.
 * - `max` (inclusive): entry activates when the current breakpoint is this
 *   name or narrower.
 * - Providing both scopes the entry to a range (e.g. medium-only).
 *
 * `props` contains the partial override merged over base props when the entry
 * matches.
 */
export type BreakpointOverride<P> = {
  min?: BreakpointName
  max?: BreakpointName
  props?: Partial<P>
}

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
 * of `{ min?, max?, props? }` entries. At render time, any entry whose
 * min/max window covers the current breakpoint has its `props` merged over
 * the base props. Later matching entries win over earlier ones.
 *
 * @example
 * <ResponsiveTile
 *   spacing="base"
 *   breakpoints={[
 *     { min: "medium", max: "medium", props: { spacing: "large" } },
 *     { min: "large", props: { spacing: "larger", maxWidthLarge: 1200 } },
 *   ]}
 * >...</ResponsiveTile>
 */
export function withBreakpoints<P extends object>(
  Component: React.ComponentType<P>
): React.FC<WithBreakpointsProps<P>> {
  const Wrapped: React.FC<WithBreakpointsProps<P>> = (allProps) => {
    const { breakpoints, ...base } = allProps as WithBreakpointsProps<P> & { breakpoints?: BreakpointOverride<P>[] }
    const current = useBreakpoint()
    const baseProps = base as unknown as P

    // Runtime guard — each entry must define at least one bound
    const overrides: Partial<P> = {}
    for (const entry of breakpoints ?? []) {
      if (entry.min === undefined && entry.max === undefined) {
        throw new Error(
          "withBreakpoints: each entry in the `breakpoints` array must define `min`, `max`, or both."
        )
      }
      if (matches(current, entry.min, entry.max)) {
        if (entry.props) Object.assign(overrides, entry.props)
      }
    }

    return <Component {...baseProps} {...overrides} />
  }
  Wrapped.displayName = `withBreakpoints(${Component.displayName ?? Component.name ?? "Component"})`
  return Wrapped
}
