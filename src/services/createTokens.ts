import { createGlobalStyle } from "styled-components"
import type { ComponentType } from "react"
import {
  camelToKebab,
  getCssConstant,
  Theme,
  type TokenDefinition,
  type TokenMap,
  type TokenResult,
} from "nice-styles"
import { registerTokens, getToken as registryGetToken } from "./tokenRegistry"

/**
 * Extracts variant keys from a TokenDefinition
 */
type VariantKeys<T extends TokenDefinition> = keyof T

/**
 * Typed getToken function that accepts token name and variant.
 * Supports both custom tokens (fully typed) and core token fallback.
 */
type GetTokenFn<T extends TokenMap> = {
  <K extends keyof T, V extends VariantKeys<T[K]>>(tokenName: K, variant?: V): TokenResult
  (tokenName: string, variant?: string): TokenResult
}

/**
 * Return type of createTokens
 * Provides GlobalStyles injection and a reference to the unified getToken
 */
export interface ComponentTokens<T extends TokenMap> {
  /**
   * GlobalStyles component that injects CSS custom properties on :root
   * Pass to StylesProvider's componentStyles prop
   *
   * @example
   * <StylesProvider componentStyles={[IconStyles]}>
   *   <App />
   * </StylesProvider>
   */
  GlobalStyles: ComponentType

  /**
   * Reference to the unified token accessor.
   * Queries all registered tokens (custom + core).
   *
   * @deprecated Import getToken directly from nice-react-styles instead.
   *             Provided for backwards compatibility.
   *
   * @param tokenName - The camelCase token name (e.g., "strokeWidth", "fontSize")
   * @param variant - The variant key (e.g., "small", "base", "large")
   * @returns TokenResult with key, var, and value properties
   */
  getToken: GetTokenFn<T>
}

/**
 * Creates CSS custom property tokens with a GlobalStyles component for injection
 * via StylesProvider. Registers tokens in the unified registry for access via getToken.
 *
 * Token structure:
 * - Keys are camelCase token names (auto-converted to kebab-case for CSS)
 * - Values are variant → value mappings
 *
 * Core token names (matching nice-styles Theme) use "core" prefix regardless of
 * the prefix parameter. This allows value overrides while maintaining consistent
 * CSS variable names.
 *
 * @param tokenMap - Object mapping token names to variant → value objects
 * @param prefix - Prefix for custom token CSS variables (default: "app").
 *                 Core token overrides always use "core" prefix.
 *
 * @returns ComponentTokens object containing:
 *          - GlobalStyles: Component for injection via StylesProvider
 *          - getToken: Reference to unified token accessor (for backwards compatibility)
 *
 * @example
 * // App-level tokens
 * const AppTokenMap = {
 *   fontSize: { base: "18px" },       // overrides core → --core--font-size--base
 *   brandColor: { primary: "#f00" },  // custom → --app--brand-color--primary
 * } as const
 * export const { GlobalStyles } = createTokens(AppTokenMap)
 *
 * // Access tokens via unified getToken (import separately)
 * import { getToken } from "nice-react-styles"
 * getToken("fontSize", "base")    // works (core override)
 * getToken("brandColor", "primary") // works (custom)
 *
 * @example
 * // Namespaced component tokens
 * const ButtonTokenMap = { height: { small: "32px", base: "48px" } } as const
 * export const { GlobalStyles } = createTokens(ButtonTokenMap, "button")
 * // → --button--height--small, --button--height--base
 */
export function createTokens<T extends TokenMap>(
  tokenMap: T,
  prefix: string = "app"
): ComponentTokens<T> {
  // Register tokens in the unified registry
  registerTokens(tokenMap, prefix)

  // Generate CSS declarations
  const flatTokenMap: Record<string, string> = {}

  for (const [tokenKey, variants] of Object.entries(tokenMap)) {
    const cssName = camelToKebab(tokenKey)
    // Core token names use "core" prefix, custom tokens use provided prefix
    const effectivePrefix = tokenKey in Theme ? "core" : prefix
    for (const [variant, value] of Object.entries(variants)) {
      const cssVar = getCssConstant(effectivePrefix, cssName, variant)
      flatTokenMap[cssVar.key] = String(value)
    }
  }

  const cssDeclarations = Object.entries(flatTokenMap)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n    ")

  const GlobalStyles = createGlobalStyle`
    :root {
      ${cssDeclarations}
    }
  `

  // Return GlobalStyles and reference to unified getToken for backwards compatibility
  return { GlobalStyles, getToken: registryGetToken as GetTokenFn<T> }
}