import * as React from "react"
import {
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  type BreakpointName,
} from "nice-styles"
import { useBreakpoint } from "./useBreakpoint"

/**
 * A breakpoint key in the `breakpoints` prop.
 *
 * - bare (`"tablet"`):    matches when the current breakpoint is exactly this name
 * - `"+"` (`"tablet+"`):  matches this name **and every larger** breakpoint
 * - `"-"` (`"tablet-"`):  matches this name **and every smaller** breakpoint
 *
 * Order, smallest → largest: `phone` < `tablet` < `laptop` < `desktop`.
 *
 * Edge cases:
 * - `"phone-"` and `"phone"` are equivalent (phone is the smallest)
 * - `"desktop+"` and `"desktop"` are equivalent (desktop is the largest)
 * - `"phone+"` matches every breakpoint
 * - `"desktop-"` matches every breakpoint
 */
export type BreakpointKey =
  | BreakpointName
  | `${BreakpointName}+`
  | `${BreakpointName}-`

/**
 * Map of breakpoint keys to partial overrides for a component's props.
 *
 * Multiple keys may match a single viewport (e.g. `"tablet"`, `"tablet+"`,
 * and `"tablet-"` all match at tablet width). Specificity rule:
 * **range keys (`+`/`-`) apply first; the bare exact key applies last
 * and wins on collision.** Within each tier, insertion order is preserved.
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
 * Index of each breakpoint in the ascending order (phone=0…desktop=3).
 * Cached so the matcher does not re-scan on every entry.
 */
const ORDER_INDEX: Record<BreakpointName, number> = {
  [BREAKPOINT_PHONE]: 0,
  [BREAKPOINT_TABLET]: 1,
  [BREAKPOINT_LAPTOP]: 2,
  [BREAKPOINT_DESKTOP]: 3,
}

type ParsedKey = { name: string; modifier: "exact" | "up" | "down" }

/**
 * Split the optional `+`/`-` suffix from a breakpoint key.
 */
function parseKey(key: string): ParsedKey {
  if (key.endsWith("+")) return { name: key.slice(0, -1), modifier: "up" }
  if (key.endsWith("-")) return { name: key.slice(0, -1), modifier: "down" }
  return { name: key, modifier: "exact" }
}

/**
 * Determine whether a parsed key activates at the current viewport.
 */
function matches(parsed: ParsedKey, current: BreakpointName): boolean {
  const target = ORDER_INDEX[parsed.name as BreakpointName]
  // Guard against unknown breakpoint names — the type system prevents this
  // at the call site, but a stray runtime key would otherwise read undefined.
  if (target === undefined) return false

  const currentIdx = ORDER_INDEX[current]
  if (parsed.modifier === "exact") return currentIdx === target
  if (parsed.modifier === "up") return currentIdx >= target
  return currentIdx <= target
}

/**
 * True for non-null, non-array, non-React-element objects whose own keys can
 * safely be spread-merged. Reject React elements (have `$$typeof`), arrays,
 * functions, and primitives — they replace as a unit.
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
 */
function mergeOneLevel<T extends object>(base: T, override: Partial<T>): T {
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) }
  for (const key of Object.keys(override) as Array<keyof T & string>) {
    const b = (base as Record<string, unknown>)[key]
    const o = (override as Record<string, unknown>)[key]
    if (isPlainObject(b) && isPlainObject(o)) {
      result[key] = { ...(b as object), ...(o as object) }
    } else {
      result[key] = o
    }
  }
  return result as T
}

/**
 * Apply a `BreakpointOverride` map to `working` props using Option-A
 * specificity ordering: every matching range key (`+`/`-`) merges first
 * (in insertion order), then matching exact keys merge last so the most
 * specific match wins on collision.
 */
function applyOverride<P extends object>(
  working: P,
  override: BreakpointOverride<P>,
  current: BreakpointName
): P {
  const exact: Array<Partial<P>> = []
  let next = working

  // Pass 1 — range modifiers, in insertion order.
  for (const [key, props] of Object.entries(override)) {
    if (!props) continue
    const parsed = parseKey(key)
    if (parsed.modifier === "exact") {
      // Defer exact keys to pass 2 so they win on collisions with ranges.
      if (matches(parsed, current)) exact.push(props as Partial<P>)
      continue
    }
    if (matches(parsed, current)) {
      next = mergeOneLevel(next, props as Partial<P>)
    }
  }

  // Pass 2 — exact keys, in their original insertion order.
  for (const props of exact) {
    next = mergeOneLevel(next, props)
  }

  return next
}

/**
 * Wraps a component with a generic `breakpoints` prop that accepts an object
 * keyed by breakpoint name (with optional `+`/`-` range modifiers).
 *
 * **Specificity rule:** at any given viewport, all matching range keys
 * (`+`/`-`) merge first in insertion order; the bare exact key merges last
 * and wins on conflict. This mirrors CSS specificity intuition — the most
 * specific match supersedes broader ones.
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
 */
export function withBreakpoints<P extends object>(
  Component: React.ComponentType<P>,
  defaults?: BreakpointOverride<P>
): React.FC<WithBreakpointsProps<P>> {
  const Wrapped: React.FC<WithBreakpointsProps<P>> = (allProps) => {
    const { breakpoints, ...base } = allProps as WithBreakpointsProps<P> & { breakpoints?: BreakpointOverride<P> }
    const current = useBreakpoint()
    let working = base as unknown as P

    // Defaults first — caller breakpoints follow so callers always win.
    if (defaults) working = applyOverride(working, defaults, current)
    if (breakpoints) working = applyOverride(working, breakpoints, current)

    return <Component {...working} />
  }
  Wrapped.displayName = `withBreakpoints(${Component.displayName ?? Component.name ?? "Component"})`
  return Wrapped
}