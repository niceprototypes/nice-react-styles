import * as React from "react"
import {
  BREAKPOINT_SMALL,
  BREAKPOINT_MEDIUM,
  BREAKPOINT_LARGE,
  type BreakpointName,
} from "nice-styles"
import { useBreakpoint } from "./useBreakpoint"

/**
 * `props` field shape — either a flat partial override or a function that
 * receives the base props and returns a partial override. The function form
 * enables deriving one prop from another (swap, compose, move slots).
 */
export type BreakpointOverrideProps<P> = Partial<P> | ((base: P) => Partial<P>)

/**
 * A single entry in the `breakpoints` prop array.
 *
 * At least one of `min` or `max` must be defined — a runtime guard throws if
 * both are missing. (A union-based type-level guard was tried, but it breaks
 * TypeScript's contextual inference of the `base` parameter in the function
 * form of `props`, so the check is enforced at runtime only.)
 *
 * - `min` (inclusive): override activates when the current breakpoint is this
 *   name or wider.
 * - `max` (inclusive): override activates when the current breakpoint is this
 *   name or narrower.
 * - Providing both scopes the override to a range (e.g. medium-only).
 */
export type BreakpointOverride<P> = {
  min?: BreakpointName
  max?: BreakpointName
  props: BreakpointOverrideProps<P>
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
 * of `{ min?, max?, props }` overrides. At render time, any entry whose
 * min/max window covers the current breakpoint has its `props` merged over
 * the base props. Later matching entries win over earlier ones.
 *
 * Because overrides are typed as `Partial<P>`, every prop the component
 * already accepts — and any prop ever added to it later — is automatically
 * responsive without per-prop plumbing.
 *
 * `props` may be either a flat `Partial<P>` object or a function
 * `(base) => Partial<P>`. The function form receives the base props and can
 * derive an override from them — useful for moving elements between slots
 * (e.g. `contentLeft` → `contentRight`) without naming the element twice.
 *
 * @example
 * // Flat form
 * <ResponsiveTile
 *   spacing="base"
 *   breakpoints={[
 *     { min: "medium", max: "medium", props: { spacing: "large" } },
 *     { min: "large", props: { spacing: "larger", maxWidthLarge: 1200 } },
 *   ]}
 * >...</ResponsiveTile>
 *
 * @example
 * // Function form — swap slots without naming the element twice
 * <ResponsiveTile
 *   contentLeft={<Avatar />}
 *   breakpoints={[
 *     {
 *       min: "large",
 *       props: (base) => ({
 *         contentLeft: undefined,
 *         contentRight: base.contentLeft,
 *       }),
 *     },
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
        const resolved = typeof entry.props === "function" ? entry.props(baseProps) : entry.props
        Object.assign(overrides, resolved)
      }
    }

    return <Component {...baseProps} {...overrides} />
  }
  Wrapped.displayName = `withBreakpoints(${Component.displayName ?? Component.name ?? "Component"})`
  return Wrapped
}
