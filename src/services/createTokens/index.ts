import type { ComponentType } from "react"
import { injectTokenCSS } from "./tokenStyleSheet"
import {
  camelToKebab,
  getConstant,
  getBreakpoint,
  componentTokensData,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  type TokenDefinition,
  type TokenMap,
  type TokenResult,
} from "nice-styles"
import { registerTokens } from "../registerTokens"
import { getToken as registryGetToken } from "../getToken"
import { DEFAULT_MODE, DEFAULT_BREAKPOINT } from "../styleValues"
import { isStyleValue } from "../isStyleValue"
import type { ModeValue } from "../ModeValue"
import type { BreakpointValue } from "../BreakpointValue"

// Known component prefixes — used to detect 3-level token overrides
const componentPrefixes = new Set(Object.keys(componentTokensData))

/**
 * Extracts variant keys from a TokenDefinition
 */
type VariantKeys<T extends TokenDefinition> = keyof T

/**
 * Typed getToken function that accepts token name and variant.
 */
type GetTokenFn<T extends TokenMap> = {
  <K extends keyof T, V extends VariantKeys<T[K]>>(tokenName: K, variant?: V, mode?: string): TokenResult
  (tokenName: string, variant?: string, mode?: string): TokenResult
}

/**
 * Return type of createTokens
 */
export interface ComponentTokens<T extends TokenMap> {
  /**
   * GlobalStyles component that injects CSS custom properties on :root
   */
  GlobalStyles: ComponentType

  /**
   * Reference to the unified token accessor.
   * @deprecated Import getToken directly from nice-react-styles instead.
   */
  getToken: GetTokenFn<T>
}

/**
 * Token map that supports mode values
 */
type TokenMapWithModes = Record<string, Record<string, string | number | ModeValue>>

/**
 * Processes variant entries into CSS declarations.
 * Shared by both flat tokens and component token overrides.
 *
 * Handles three value shapes:
 * - Simple value: `"16px"` → single :root declaration
 * - ModeValue: `{ day: "#000", night: "#fff" }` → default + mode primitives + mode media entries
 * - BreakpointValue: `{ small: "14px", large: "20px" }` → default + breakpoint primitives + breakpoint media entries
 *
 * BreakpointValue is checked before ModeValue — they are mutually exclusive on the same variant.
 *
 * @param cssName - Kebab-case token name
 * @param variants - Variant-to-value map (may include ModeValue or BreakpointValue objects)
 * @param pkg - Component prefix for CSS variable namespace, or undefined for core tokens
 * @param defaultDeclarations - Collects :root declarations
 * @param modeDeclarations - Collects mode-specific declarations for @media (prefers-color-scheme) blocks
 * @param breakpointDeclarations - Collects breakpoint-specific declarations for @media (min-width) blocks
 */
function processVariants(
  cssName: string,
  variants: Record<string, string | number | ModeValue | BreakpointValue>,
  pkg: string | undefined,
  defaultDeclarations: string[],
  modeDeclarations: Map<string, string[]>,
  breakpointDeclarations: Map<string, string[]>
): void {
  for (const [variant, value] of Object.entries(variants)) {
    if (isStyleValue("breakpoint", value)) {
      // Breakpoint value — semantic variable gets the default breakpoint (phone) value
      const defaultValue = value[DEFAULT_BREAKPOINT]
      const cssVar = getConstant(cssName, variant, { pkg })
      defaultDeclarations.push(`${cssVar.key}: ${defaultValue};`)

      for (const [breakpoint, bpValue] of Object.entries(value)) {
        if (breakpoint !== DEFAULT_BREAKPOINT) {
          // Non-default breakpoint primitive — stable reference (e.g., --*--laptop: value)
          const bpCssVar = getConstant(cssName, variant, { breakpoint, pkg })
          defaultDeclarations.push(`${bpCssVar.key}: ${bpValue};`)

          // Media query entry — reassigns semantic variable to breakpoint primitive at viewport
          const declarations = breakpointDeclarations.get(breakpoint)
          if (declarations) {
            declarations.push(`${cssVar.key}: var(${bpCssVar.key});`)
          }
        }
      }
    } else if (isStyleValue("mode", value)) {
      // Mode value — semantic variable gets the default mode (day) value
      const defaultValue = value[DEFAULT_MODE]
      const cssVar = getConstant(cssName, variant, { pkg })
      defaultDeclarations.push(`${cssVar.key}: ${defaultValue};`)

      for (const [mode, modeValue] of Object.entries(value)) {
        if (mode !== DEFAULT_MODE) {
          // Non-default mode primitive — stable reference, never reassigned (e.g., --*--night: value)
          const modeCssVar = getConstant(cssName, variant, { mode, pkg })
          defaultDeclarations.push(`${modeCssVar.key}: ${modeValue};`)

          // Media query entry — reassigns semantic variable to mode primitive at runtime
          const declarations = modeDeclarations.get(mode)
          if (declarations) {
            declarations.push(`${cssVar.key}: var(${modeCssVar.key});`)
          }
        }
      }
    } else {
      // Simple value — single declaration, no mode or breakpoint variants
      const cssVar = getConstant(cssName, variant, { pkg })
      defaultDeclarations.push(`${cssVar.key}: ${value};`)
    }
  }
}

/**
 * Creates CSS custom property tokens with a GlobalStyles component.
 * Supports mode variants for theming (day/night/custom modes).
 *
 * Detects component token overrides automatically: top-level keys matching a
 * known component prefix (button, icon, tile, typography) are treated as
 * 3-level structures (prefix -> tokenName -> variant) and generate
 * --np--{prefix}--{token}--{variant} CSS variables.
 *
 * @param tokenMap - Object mapping token names to variant -> value objects
 * @param prefix - Optional component prefix for CSS variables (e.g., "button", "tile")
 * @param options - Optional configuration
 * @param options.colorSchemeEnabled - When true, emits `@media (prefers-color-scheme: dark)` for
 *   automatic dark mode switching. Default: false (night primitives are still generated for
 *   force-pinning, but the automatic switch is omitted).
 *
 * @example
 * // Simple tokens (default mode only)
 * const AppTokens = {
 *   fontSize: { base: "20px" },
 * } as const
 *
 * @example
 * // Component token override — overrides --np--icon--size--base
 * const AppTokens = {
 *   icon: { size: { base: "32px" } },
 * } as const
 *
 * @example
 * // Tokens with mode variants (no auto dark mode)
 * const AppTokens = {
 *   brandColor: {
 *     primary: { day: "#dc0000", night: "#ff6666" }
 *   }
 * } as const
 *
 * @example
 * // Opt in to auto dark mode
 * createTokens(AppTokens, "app", { colorSchemeEnabled: true })
 *
 * @example
 * // Breakpoint-aware tokens (phone-first, always active)
 * const AppTokens = {
 *   fontSize: {
 *     base: { phone: "16px", laptop: "20px" },
 *     large: { phone: "22px", laptop: "28px", desktop: "32px" },
 *   }
 * } as const
 */
export function createTokens<T extends TokenMap | TokenMapWithModes>(
  tokenMap: T,
  prefix?: string,
  options?: { colorSchemeEnabled?: boolean }
): ComponentTokens<T extends TokenMap ? T : TokenMap> {
  type VariantValue = string | number | ModeValue | BreakpointValue
  type VariantMap = Record<string, VariantValue>

  // Separate flat tokens from component token overrides
  const flatTokens: Record<string, VariantMap> = {}
  const componentOverrides: Record<string, Record<string, VariantMap>> = {}

  for (const [key, value] of Object.entries(tokenMap)) {
    if (componentPrefixes.has(key)) {
      // Component prefix — expect 3-level structure: prefix -> tokenName -> variant
      componentOverrides[key] = value as Record<string, VariantMap>
    } else {
      flatTokens[key] = value as VariantMap
    }
  }

  // Register flat tokens only — component overrides work via CSS variable cascade
  registerTokens(flatTokens, prefix)

  /**
   * Scan a variant map for mode and breakpoint dimension keys.
   * Populates the shared modes/breakpoints sets so we can pre-initialize
   * the declaration maps before processing.
   */
  function collectDimensions(variants: VariantMap, modes: Set<string>, breakpoints: Set<string>): void {
    for (const value of Object.values(variants)) {
      if (isStyleValue("breakpoint", value)) {
        for (const bp of Object.keys(value)) {
          breakpoints.add(bp)
        }
      } else if (isStyleValue("mode", value)) {
        for (const mode of Object.keys(value)) {
          modes.add(mode)
        }
      }
    }
  }

  // Collect all modes and breakpoints from flat tokens and component overrides
  const modes = new Set<string>([DEFAULT_MODE])
  const breakpoints = new Set<string>([DEFAULT_BREAKPOINT])

  for (const variants of Object.values(flatTokens)) {
    collectDimensions(variants, modes, breakpoints)
  }
  for (const tokenGroups of Object.values(componentOverrides)) {
    for (const variants of Object.values(tokenGroups)) {
      collectDimensions(variants, modes, breakpoints)
    }
  }

  // Initialize declaration accumulators
  const defaultDeclarations: string[] = []

  // Mode declarations — keyed by non-default mode name (e.g., "night")
  const modeDeclarations: Map<string, string[]> = new Map()
  for (const mode of modes) {
    if (mode !== DEFAULT_MODE) {
      modeDeclarations.set(mode, [])
    }
  }

  // Breakpoint declarations — keyed by non-default breakpoint name (e.g., "medium", "large")
  const breakpointDeclarations: Map<string, string[]> = new Map()
  for (const bp of breakpoints) {
    if (bp !== DEFAULT_BREAKPOINT) {
      breakpointDeclarations.set(bp, [])
    }
  }

  // Flat tokens — 2-level: tokenName -> variant
  for (const [tokenKey, variants] of Object.entries(flatTokens)) {
    processVariants(camelToKebab(tokenKey), variants, prefix, defaultDeclarations, modeDeclarations, breakpointDeclarations)
  }

  // Component token overrides — 3-level: prefix -> tokenName -> variant
  for (const [componentPrefix, tokenGroups] of Object.entries(componentOverrides)) {
    for (const [tokenName, variants] of Object.entries(tokenGroups)) {
      processVariants(camelToKebab(tokenName), variants, componentPrefix, defaultDeclarations, modeDeclarations, breakpointDeclarations)
    }
  }

  // Build CSS string — :root block with all default + primitive declarations
  let cssString = `
    :root {
      ${defaultDeclarations.join("\n      ")}
    }
  `

  // Color scheme media query — opt-in via colorSchemeEnabled option
  if (options?.colorSchemeEnabled) {
    const nightDeclarations = modeDeclarations.get("night")
    if (nightDeclarations && nightDeclarations.length > 0) {
      cssString += `
    @media (prefers-color-scheme: dark) {
      :root {
        ${nightDeclarations.join("\n        ")}
      }
    }
    `
    }
  }

  // Breakpoint media queries — always active (not opt-in), phone-first via min-width
  // Breakpoint query map: breakpoint name → media query string
  const breakpointQueries: Record<string, string> = {
    [BREAKPOINT_TABLET]: getBreakpoint(BREAKPOINT_TABLET).query,
    [BREAKPOINT_LAPTOP]: getBreakpoint(BREAKPOINT_LAPTOP).query,
    [BREAKPOINT_DESKTOP]: getBreakpoint(BREAKPOINT_DESKTOP).query,
  }

  for (const [bp, declarations] of breakpointDeclarations.entries()) {
    if (declarations.length > 0) {
      const query = breakpointQueries[bp]
      if (query) {
        cssString += `
    ${query} {
      :root {
        ${declarations.join("\n        ")}
      }
    }
    `
      }
    }
  }

  // Inject CSS into shared <style data-nice-tokens> element at module load time
  injectTokenCSS(prefix ?? "", cssString)

  // No-op component — CSS is already injected above.
  // Kept for backwards compat: external consumers may still render <GlobalStyles />.
  const GlobalStyles: ComponentType = () => null

  return {
    GlobalStyles,
    getToken: registryGetToken as GetTokenFn<T extends TokenMap ? T : TokenMap>,
  }
}