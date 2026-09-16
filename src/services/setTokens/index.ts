import {
  generateTokenCSS,
  injectTokenCSS,
  type TokenMap,
  type ThemeValue,
  type BreakpointValues,
} from "nice-styles"

type TokenMapWithThemes = Record<string, Record<string, string | number | ThemeValue>>

/** Reserved `breakpoints` key: pixel floors for the settable breakpoints. */
type BreakpointsKey = { breakpoints?: Partial<BreakpointValues> }

/**
 * React wrapper around `generateTokenCSS` from nice-styles. Builds the token
 * CSS string and injects it into a shared `<style data-nice-tokens>` element.
 *
 * Top-level keys of the token map are auto-classified by `generateTokenCSS`:
 * - `breakpoints` → breakpoint thresholds in pixels (`tablet`, `laptop`,
 *   `desktop`; ascending). Applied before the rest of the map, so breakpoint
 *   values in the same call use them; updates `getBreakpoint`,
 *   `getBreakpointValue`, and `useBreakpoint`; and re-emits every earlier
 *   `setTokens` stylesheet at the new thresholds. Invalid values throw.
 * - Known component prefixes (`button`, `icon`, `tile`, …) → component token
 *   overrides.
 * - Everything else → flat tokens registered into the unified registry.
 *
 * @param tokenMap - Object mapping token names to variant → value objects, plus an optional `breakpoints` key.
 * @param prefix - Optional component prefix for the CSS variable namespace.
 *
 * @example
 * setTokens({
 *   breakpoints: { laptop: 1100 },
 *   fontSize: { base: { phone: "16px", "laptop+": "20px" } },
 *   brandColor: { primary: { day: "#dc0000", night: "#ff6666" } },
 * })
 */
export function setTokens<T extends (TokenMap | TokenMapWithThemes) & BreakpointsKey>(
  tokenMap: T,
  prefix?: string
): void {
  const css = generateTokenCSS(tokenMap, prefix)
  injectTokenCSS(prefix ?? "", css)
}

/**
 * Shortcut for `setTokens({ breakpoints })` — sets the settable breakpoint
 * floors in pixels (`tablet`, `laptop`, `desktop`; ascending) and re-emits every
 * earlier `setTokens` stylesheet at the new thresholds, updating `getBreakpoint`,
 * `getBreakpointValue`, and `useBreakpoint`. `phone` is the immutable base.
 * Invalid values throw (same validation as the `breakpoints` key).
 *
 * @param breakpoints - Partial map of settable breakpoint floors in pixels.
 *
 * @example
 * setBreakpoints({ laptop: 1100, desktop: 1800 })
 */
export function setBreakpoints(breakpoints: Partial<BreakpointValues>): void {
  setTokens({ breakpoints })
}
