import { createGlobalStyle } from "styled-components"
import type { ComponentType } from "react"
import {
  camelToKebab,
  getCssConstant,
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
 * @param tokenMap - Object mapping token names to variant → value objects
 * @param prefix - Prefix for CSS variables (default: "app")
 *
 * @returns ComponentTokens object containing:
 *          - GlobalStyles: Component for injection via StylesProvider
 *          - getToken: Reference to unified token accessor (for backwards compatibility)
 *
 * @example
 * // App-level tokens
 * const AppTokenMap = {
 *   brandColor: { primary: "#f00" },
 * } as const
 * export const { GlobalStyles } = createTokens(AppTokenMap)
 * // → --app--brand-color--primary
 *
 * @example
 * // Namespaced component tokens
 * const ButtonTokenMap = { height: { small: "32px", base: "48px" } } as const
 * export const { GlobalStyles } = createTokens(ButtonTokenMap, "button")
 * // → --button--height--small, --button--height--base
 *
 * @example
 * // Override core tokens (explicitly use "core" prefix)
 * const CoreOverrides = { fontSize: { base: "18px" } } as const
 * export const { GlobalStyles } = createTokens(CoreOverrides, "core")
 * // → --core--font-size--base: 18px
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

  // Return GlobalStyles and reference to unified getToken for backwards compatibility
  return { GlobalStyles, getToken: registryGetToken as GetTokenFn<T> }
}