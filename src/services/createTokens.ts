import type { ComponentType } from "react"
import { injectTokenCSS } from "../utilities/tokenStyleSheet"
import {
  camelToKebab,
  getConstant,
  componentTokensData,
  type TokenDefinition,
  type TokenMap,
  type TokenResult,
} from "nice-styles"
import {
  registerTokens,
  getToken as registryGetToken,
  DEFAULT_MODE,
  isModeValue,
  type ModeValue,
} from "./tokenRegistry"

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
 * @param cssName - Kebab-case token name
 * @param variants - Variant-to-value map (may include ModeValue objects)
 * @param pkg - Component prefix for CSS variable namespace, or undefined for core tokens
 * @param defaultDeclarations - Collects :root declarations
 * @param modeDeclarations - Collects mode-specific declarations for media queries
 */
function processVariants(
  cssName: string,
  variants: Record<string, string | number | ModeValue>,
  pkg: string | undefined,
  defaultDeclarations: string[],
  modeDeclarations: Map<string, string[]>
): void {
  for (const [variant, value] of Object.entries(variants)) {
    if (isModeValue(value)) {
      // Mode value — generate default + mode primitives
      const defaultValue = value[DEFAULT_MODE]
      const cssVar = getConstant(cssName, variant, { pkg })
      defaultDeclarations.push(`${cssVar.key}: ${defaultValue};`)

      for (const [mode, modeValue] of Object.entries(value)) {
        if (mode !== DEFAULT_MODE) {
          const modeCssVar = getConstant(cssName, variant, { mode, pkg })
          defaultDeclarations.push(`${modeCssVar.key}: ${modeValue};`)

          const declarations = modeDeclarations.get(mode)
          if (declarations) {
            declarations.push(`${cssVar.key}: var(${modeCssVar.key});`)
          }
        }
      }
    } else {
      // Simple value — default mode only
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
 */
export function createTokens<T extends TokenMap | TokenMapWithModes>(
  tokenMap: T,
  prefix?: string,
  options?: { colorSchemeEnabled?: boolean }
): ComponentTokens<T extends TokenMap ? T : TokenMap> {
  // Separate flat tokens from component token overrides
  const flatTokens: Record<string, Record<string, string | number | ModeValue>> = {}
  const componentOverrides: Record<string, Record<string, Record<string, string | number | ModeValue>>> = {}

  for (const [key, value] of Object.entries(tokenMap)) {
    if (componentPrefixes.has(key)) {
      // Component prefix — expect 3-level structure: prefix -> tokenName -> variant
      componentOverrides[key] = value as Record<string, Record<string, string | number | ModeValue>>
    } else {
      flatTokens[key] = value as Record<string, string | number | ModeValue>
    }
  }

  // Register flat tokens only — component overrides work via CSS variable cascade
  registerTokens(flatTokens, prefix)

  // Collect all modes from flat tokens
  const modes = new Set<string>([DEFAULT_MODE])
  for (const variants of Object.values(flatTokens)) {
    for (const value of Object.values(variants)) {
      if (isModeValue(value)) {
        for (const mode of Object.keys(value)) {
          modes.add(mode)
        }
      }
    }
  }

  // Collect modes from component overrides — one level deeper
  for (const tokenGroups of Object.values(componentOverrides)) {
    for (const variants of Object.values(tokenGroups)) {
      for (const value of Object.values(variants)) {
        if (isModeValue(value)) {
          for (const mode of Object.keys(value)) {
            modes.add(mode)
          }
        }
      }
    }
  }

  // Generate CSS declarations
  const defaultDeclarations: string[] = []
  const modeDeclarations: Map<string, string[]> = new Map()

  // Initialize mode declaration arrays for non-default modes
  for (const mode of modes) {
    if (mode !== DEFAULT_MODE) {
      modeDeclarations.set(mode, [])
    }
  }

  // Flat tokens — 2-level: tokenName -> variant
  for (const [tokenKey, variants] of Object.entries(flatTokens)) {
    processVariants(camelToKebab(tokenKey), variants, prefix, defaultDeclarations, modeDeclarations)
  }

  // Component token overrides — 3-level: prefix -> tokenName -> variant
  for (const [componentPrefix, tokenGroups] of Object.entries(componentOverrides)) {
    for (const [tokenName, variants] of Object.entries(tokenGroups)) {
      processVariants(camelToKebab(tokenName), variants, componentPrefix, defaultDeclarations, modeDeclarations)
    }
  }

  // Build CSS string
  let cssString = `
    :root {
      ${defaultDeclarations.join("\n      ")}
    }
  `

  // Add media query for night mode if enabled and declarations exist
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