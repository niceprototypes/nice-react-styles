import {
  generateTokenCSS,
  injectTokenCSS,
  type TokenMap,
  type ThemeValue,
} from "nice-styles"

type TokenMapWithThemes = Record<string, Record<string, string | number | ThemeValue>>

/**
 * React wrapper around `generateTokenCSS` from nice-styles. Builds the token
 * CSS string and injects it into a shared `<style data-nice-tokens>` element.
 *
 * Top-level keys of the token map are auto-classified by `generateTokenCSS`:
 * - Known component prefixes (`button`, `icon`, `tile`, …) → 3-level component
 *   token overrides.
 * - Everything else → flat tokens registered into the unified registry.
 *
 * Breakpoint thresholds are not part of a token map — call `setBreakpoints`
 * first; a `breakpoints` key here is ignored with a console warning.
 *
 * @param tokenMap - Object mapping token names to variant → value objects.
 * @param prefix - Optional component prefix for the CSS variable namespace.
 * @param options.colorSchemeEnabled - When true, emits
 *   `@media (prefers-color-scheme: dark)` for automatic dark-theme switching.
 *
 * @example
 * setTokens({
 *   fontSize: { base: "20px" },
 *   brandColor: { primary: { day: "#dc0000", night: "#ff6666" } },
 * })
 */
export function setTokens<T extends TokenMap | TokenMapWithThemes>(
  tokenMap: T,
  prefix?: string,
  options?: { colorSchemeEnabled?: boolean }
): void {
  const css = generateTokenCSS(tokenMap, prefix, options)
  injectTokenCSS(prefix ?? "", css)
}
