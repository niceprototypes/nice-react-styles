import { createGlobalStyle } from "styled-components"
import type { ComponentType } from "react"
import {
  camelToKebab,
  getCssConstant,
  getTokenFromMap,
  Theme,
  type TokenDefinition,
  type TokenMap,
  type TokenResult,
} from "nice-styles"

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
 * Provides both GlobalStyles injection and typed programmatic access to tokens
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
   * Typed accessor function to get token values.
   * First checks the custom token map, then falls back to core tokens.
   *
   * @param tokenName - The camelCase token name (e.g., "strokeWidth", "fontSize")
   * @param variant - The variant key (e.g., "small", "base", "large")
   * @returns TokenResult with key, var, and value properties
   * @throws Error if token or variant is not found in custom or core tokens
   *
   * @example
   * getToken("strokeWidth", "base")
   * // Returns: {
   * //   key: "--icon--stroke-width--base",
   * //   var: "var(--icon--stroke-width--base)",
   * //   value: "1.5px"
   * // }
   */
  getToken: GetTokenFn<T>
}

/**
 * Creates CSS custom property tokens with a GlobalStyles component for injection
 * via StylesProvider and a typed getter function for programmatic access.
 *
 * The returned getToken function first checks the custom token map, then falls
 * back to core nice-styles tokens if not found.
 *
 * Token structure:
 * - Keys are camelCase token names (auto-converted to kebab-case for CSS)
 * - Values are variant → value mappings
 *
 * @param tokenMap - Object mapping token names to variant → value objects
 * @param prefix - Optional prefix for CSS variable names (defaults to "core").
 *                 Use custom prefixes like "button" or "icon" for namespaced tokens.
 *
 * @returns ComponentTokens object containing:
 *          - GlobalStyles: Component for injection via StylesProvider
 *          - getToken: Typed accessor function for retrieving token values
 *
 * @example
 * // Global theme customization (uses default "core" prefix)
 * const AppTokenMap = {
 *   fontSize: { base: "18px" },       // overrides core
 *   brandColor: { primary: "#f00" },  // extends core
 * } as const
 * export const { GlobalStyles, getToken } = createTokens(AppTokenMap)
 *
 * @example
 * // Namespaced component tokens
 * const ButtonTokenMap = { height: { small: "32px", base: "48px" } } as const
 * export const { GlobalStyles, getToken } = createTokens(ButtonTokenMap, "button")
 * // → --button--height--small, --button--height--base
 */
export function createTokens<T extends TokenMap>(
  tokenMap: T,
  prefix: string = "core"
): ComponentTokens<T> {
  const flatTokenMap: Record<string, string> = {}

  for (const [tokenKey, variants] of Object.entries(tokenMap)) {
    const cssName = camelToKebab(tokenKey)
    for (const [variant, value] of Object.entries(variants)) {
      const cssVar = getCssConstant(prefix, cssName, variant)
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

  const getToken = (
    tokenName: string,
    variant?: string
  ): TokenResult => {
    // Check custom token map first
    if (tokenName in tokenMap) {
      return getTokenFromMap(prefix, tokenMap, tokenName, variant)
    }
    // Fall back to core tokens
    if (tokenName in Theme) {
      return getTokenFromMap("core", Theme, tokenName, variant)
    }
    throw new Error(
      `Token "${tokenName}" not found in custom or core tokens. ` +
      `Custom tokens: ${Object.keys(tokenMap).join(", ")}`
    )
  }

  return { GlobalStyles, getToken: getToken as GetTokenFn<T> }
}