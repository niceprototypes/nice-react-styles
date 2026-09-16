/**
 * withBreakpoints — per-breakpoint prop overrides for any component.
 *
 * Wraps a component with a `breakpoints` prop whose keys use the nice-styles
 * breakpoint key grammar (`tablet`, `laptop+`, `tablet-`). At render, the keys
 * matching the current viewport (`useBreakpoint`) are merged over the base
 * props, least → most specific, so the most specific key wins.
 *
 * @example
 * const ResponsiveTile = withBreakpoints(Tile)
 * <ResponsiveTile spacing="base" breakpoints={{ "laptop+": { spacing: "large" } }} />
 */

import * as React from "react"
import {
  parseBreakpointKey,
  breakpointKeyMatches,
  compareBreakpointSpecificity,
  type BreakpointName,
  type BreakpointKey,
  type ParsedBreakpointKey,
} from "nice-styles"
import { useBreakpoint } from "./useBreakpoint"

// Public re-export — the hook is documented as importable from the package root.
export { useBreakpoint } from "./useBreakpoint"

// Re-export the shared breakpoint-key type — parsing, matching, and specificity
// all live in nice-styles so this HOC and `setTokens` agree on one grammar.
export type { BreakpointKey } from "nice-styles"

/**
 * Map of breakpoint keys to partial overrides for a component's props.
 *
 * Multiple keys may match a single viewport (e.g. `"tablet"`, `"tablet+"`,
 * and `"tablet-"` all match at tablet width). Specificity rule (most specific
 * wins): **smaller range wins; at equal range size, direction breaks the tie —
 * exact, then `-` (down), then `+` (up).** So `tablet` beats `tablet-`, and at
 * equal magnitude `laptop-` beats `tablet+`. Insertion order is irrelevant.
 */
export type BreakpointOverride<P> = {
  [K in BreakpointKey]?: Partial<P>
}

/**
 * Props shape returned by `withBreakpoints(Component)` — the original props
 * plus an optional `breakpoints` object keyed by breakpoint name.
 */
export type WithBreakpointsProps<P> = P & {
  breakpoints?: BreakpointOverride<P>
}

/**
 * True for non-null, non-array, non-React-element objects whose own keys can
 * safely be spread-merged. Reject React elements (have `$$typeof`), arrays,
 * functions, and primitives — they replace as a unit.
 *
 * @param value - Any prop value
 * @returns Whether `value` should be merged key by key
 */
function isPlainObject(value: unknown): boolean {
  if (value === null || typeof value !== "object") return false
  if (Array.isArray(value)) return false
  if ((value as { $$typeof?: unknown }).$$typeof !== undefined) return false
  return true
}

/**
 * One-level-deep merge: when both base[key] and override[key] are plain
 * objects, spread-merge them; otherwise the override value replaces.
 *
 * Allows `{ titleProps: { size: "larger" } }` to update only the `size`
 * key on the base `titleProps` without erasing siblings like `align`,
 * `weight`, etc.
 *
 * @param base - Props before this override
 * @param override - Partial props to apply
 * @returns A new props object; neither input is mutated
 */
function mergeOneLevel<T extends object>(base: T, override: Partial<T>): T {
  // Start from a shallow copy so keys the override does not mention survive
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const key of Object.keys(override) as Array<keyof T & string>) {
    const b = (base as Record<string, unknown>)[key]
    const o = (override as Record<string, unknown>)[key]
    // Object props (e.g. `titleProps`) merge one level; everything else is replaced
    if (isPlainObject(b) && isPlainObject(o)) {
      result[key] = { ...(b as object), ...(o as object) }
    } else {
      result[key] = o
    }
  }
  return result as T
}

/**
 * Apply a `BreakpointOverride` map to `working` props using specificity-first
 * ordering: collect every key that matches the current viewport, sort them
 * least → most specific via the shared `compareBreakpointSpecificity`, then
 * fold-merge in that order so the most specific match lands last and wins.
 *
 * @param working - Props so far
 * @param override - Breakpoint-keyed partial props
 * @param current - The viewport's current breakpoint
 * @returns `working` with every matching override merged in
 */
function applyOverride<P extends object>(
  working: P,
  override: BreakpointOverride<P>,
  current: BreakpointName
): P {
  // Collect the keys active at the current breakpoint (undefined entries skipped)
  const matching: Array<{ parsed: ParsedBreakpointKey; props: Partial<P> }> = []
  for (const [key, props] of Object.entries(override)) {
    if (!props) continue
    const parsed = parseBreakpointKey(key)
    if (breakpointKeyMatches(parsed, current)) {
      matching.push({ parsed, props: props as Partial<P> })
    }
  }
  // Least → most specific, the same comparator the CSS cascade ordering uses
  matching.sort((a, b) => compareBreakpointSpecificity(a.parsed, b.parsed))

  // Merge in sorted order — later (more specific) merges overwrite earlier ones
  let next = working
  for (const { props } of matching) {
    next = mergeOneLevel(next, props)
  }
  return next
}

/**
 * Wraps a component with a generic `breakpoints` prop that accepts an object
 * keyed by breakpoint name (with optional `+`/`-` range modifiers).
 *
 * **Specificity rule:** at any given viewport, every matching key is sorted by
 * specificity and merged least → most specific, so the most specific wins on
 * conflict. Smaller range beats larger; at equal range size, direction breaks
 * the tie (exact, then `-`/down, then `+`/up). Insertion order is irrelevant.
 *
 * Optional `defaults` are applied first under the same rule; caller
 * `breakpoints` then apply on top so callers always win over defaults.
 *
 * @example
 * // No defaults — breakpoints is purely caller-controlled.
 * const ResponsiveTile = withBreakpoints<TileProps>(BaseTile)
 *
 * <ResponsiveTile
 *   spacing="base"
 *   breakpoints={{
 *     tablet: { spacing: "large" },          // exactly tablet (wins at tablet)
 *     "laptop+": { spacing: "larger" },       // laptop and desktop
 *     "tablet-": { spacing: "small" },        // tablet and phone
 *   }}
 * />
 *
 * @example
 * // With defaults — applied unless the caller overrides them.
 * const DocsRow = withBreakpoints<DocsRowProps>(BaseDocsRow, {
 *   "tablet+": { previewCellWidth: "10em" },
 * })
 *
 * @param Component - Component to wrap
 * @param defaults - Breakpoint overrides applied before the caller's
 * @returns A component accepting `Component`'s props plus `breakpoints`
 */
export function withBreakpoints<P extends object>(
  Component: React.ComponentType<P>,
  defaults?: BreakpointOverride<P>
): React.FC<WithBreakpointsProps<P>> {
  const Wrapped: React.FC<WithBreakpointsProps<P>> = (allProps) => {
    // Split off `breakpoints` so it is never forwarded to the wrapped component
    const { breakpoints, ...base } = allProps as WithBreakpointsProps<P> & { breakpoints?: BreakpointOverride<P> }
    // Subscribes to resize, so the wrapper re-renders when the breakpoint changes
    const current = useBreakpoint()
    let working = base as unknown as P

    // Defaults first — caller breakpoints follow so callers always win.
    if (defaults) working = applyOverride(working, defaults, current)
    if (breakpoints) working = applyOverride(working, breakpoints, current)

    return <Component {...working} />
  }
  // Name the wrapper in React DevTools after the wrapped component
  Wrapped.displayName = `withBreakpoints(${Component.displayName ?? Component.name ?? "Component"})`
  return Wrapped
}