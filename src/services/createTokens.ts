import type { ComponentType } from "react"
import { injectTokenCSS } from "../utilities/tokenStyleSheet"
import {
  camelToKebab,
  getConstant,
  type TokenDefinition,
  type TokenMap,
  type TokenResult,
} from "nice-styles"
import {
  registerTokens,
  getToken as registryGetToken,
  DEFAULT_PREFIX,
  DEFAULT_MODE,
  isModeValue,
  type ModeValue,
} from "./tokenRegistry"

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
 * Creates CSS custom property tokens with a GlobalStyles component.
 * Supports mode variants for theming (light/dark/custom modes).
 *
 * @param tokenMap - Object mapping token names to variant → value objects
 * @param prefix - Prefix for CSS variables (default: "core")
 *
 * @example
 * // Simple tokens (default mode only)
 * const AppTokens = {
 *   fontSize: { base: "20px" },
 * } as const
 *
 * @example
 * // Tokens with mode variants
 * const AppTokens = {
 *   brandColor: {
 *     primary: { light: "#dc0000", dark: "#ff6666" }
 *   }
 * } as const
 */
export function createTokens<T extends TokenMap | TokenMapWithModes>(
  tokenMap: T,
  prefix: string = DEFAULT_PREFIX
): ComponentTokens<T extends TokenMap ? T : TokenMap> {
  // Register tokens in the unified registry
  registerTokens(tokenMap as TokenMapWithModes, prefix)

  // Collect all modes used in this token map
  const modes = new Set<string>([DEFAULT_MODE])
  for (const variants of Object.values(tokenMap)) {
    for (const value of Object.values(variants)) {
      if (isModeValue(value)) {
        for (const mode of Object.keys(value)) {
          modes.add(mode)
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

  for (const [tokenKey, variants] of Object.entries(tokenMap)) {
    const cssName = camelToKebab(tokenKey)

    for (const [variant, value] of Object.entries(variants)) {
      if (isModeValue(value)) {
        // Mode value: generate default + mode primitives
        const defaultValue = value[DEFAULT_MODE]
        const cssVar = getConstant(prefix, cssName, variant)
        defaultDeclarations.push(`${cssVar.key}: ${defaultValue};`)

        // Generate mode primitives and collect for media query
        for (const [mode, modeValue] of Object.entries(value)) {
          if (mode !== DEFAULT_MODE) {
            const modeCssVar = getConstant(prefix, cssName, variant, mode)
            defaultDeclarations.push(`${modeCssVar.key}: ${modeValue};`)

            // Add reassignment for media query
            const declarations = modeDeclarations.get(mode)
            if (declarations) {
              declarations.push(`${cssVar.key}: var(${modeCssVar.key});`)
            }
          }
        }
      } else {
        // Simple value: default mode only
        const cssVar = getConstant(prefix, cssName, variant)
        defaultDeclarations.push(`${cssVar.key}: ${value};`)
      }
    }
  }

  // Build CSS string
  let cssString = `
    :root {
      ${defaultDeclarations.join("\n      ")}
    }
  `

  // Add media query for dark mode if it exists
  const darkDeclarations = modeDeclarations.get("dark")
  if (darkDeclarations && darkDeclarations.length > 0) {
    cssString += `
    @media (prefers-color-scheme: dark) {
      :root {
        ${darkDeclarations.join("\n        ")}
      }
    }
    `
  }

  // Inject CSS into shared <style data-nice-tokens> element at module load time
  injectTokenCSS(prefix, cssString)

  // No-op component — CSS is already injected above.
  // Kept for backwards compat: external consumers may still render <GlobalStyles />.
  const GlobalStyles: ComponentType = () => null

  return {
    GlobalStyles,
    getToken: registryGetToken as GetTokenFn<T extends TokenMap ? T : TokenMap>,
  }
}