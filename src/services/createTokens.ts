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
 * Typed getComponentToken function that accepts token name and variant
 */
type GetComponentTokenFn<T extends TokenMap> = <
  K extends keyof T,
  V extends VariantKeys<T[K]>
>(
  tokenName: K,
  variant?: V
) => TokenResult

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
   * Typed accessor function to get individual component token values
   * Accepts token name and optional variant
   *
   * @param tokenName - The camelCase token name (e.g., "strokeWidth")
   * @param variant - The variant key (e.g., "small", "base", "large")
   * @returns TokenResult with key, var, and value properties
   * @throws Error if token or variant is not found
   *
   * @example
   * getComponentToken("strokeWidth", "base")
   * // Returns: {
   * //   key: "--icon--stroke-width--base",
   * //   var: "var(--icon--stroke-width--base)",
   * //   value: "1.5px"
   * // }
   */
  getComponentToken: GetComponentTokenFn<T>
}

/**
 * Creates component-level CSS custom property tokens with a GlobalStyles component
 * for injection via StylesProvider and a typed getter function for programmatic access.
 *
 * When using the default "app" prefix, tokens that exist in the core nice-styles theme
 * are automatically treated as overrides and use the "core" prefix. Custom tokens use "app".
 * When a specific prefix is provided (e.g., "button", "icon"), all tokens use that prefix.
 *
 * Token structure:
 * - Keys are camelCase token names (auto-converted to kebab-case for CSS)
 * - Values are variant → value mappings
 *
 * @param tokenMap - Object mapping token names to variant → value objects
 * @param prefix - Optional prefix for CSS variable names (defaults to "app").
 *                 When "app", core token names are auto-detected as overrides using "core" prefix.
 *                 When a specific prefix is provided, all tokens use that prefix.
 *
 * @returns ComponentTokens object containing:
 *          - GlobalStyles: Component for injection via StylesProvider
 *          - getComponentToken: Typed accessor function for retrieving token values
 *
 * @example
 * const AppTokenMap = {
 *   // Override token (exists in core) - uses "core" prefix
 *   fontSize: {
 *     base: "20px",
 *     larger: "40px",
 *   },
 *   // Custom token (not in core) - uses provided prefix or "app"
 *   brandColor: {
 *     primary: "#dc0000",
 *   },
 * } as const
 *
 * export const { GlobalStyles, getComponentToken } = createTokens(AppTokenMap)
 */
export function createTokens<T extends TokenMap>(
  tokenMap: T,
  prefix: string = "app"
): ComponentTokens<T> {
  // Build flattened CSS variable map using standardized format: --{pkg}--{token}--{param}
  // When using default "app" prefix, tokens that exist in core Theme are treated as overrides
  // and use "core" prefix. When a specific prefix is provided, all tokens use that prefix.
  const flatTokenMap: Record<string, string> = {}
  const tokenPrefixMap: Record<string, string> = {}
  const useAutoOverride = prefix === "app"

  for (const [tokenKey, variants] of Object.entries(tokenMap)) {
    const isOverride = useAutoOverride && tokenKey in Theme
    const tokenPrefix = isOverride ? "core" : prefix
    tokenPrefixMap[tokenKey] = tokenPrefix

    const cssName = camelToKebab(tokenKey)
    for (const [variant, value] of Object.entries(variants)) {
      const cssVar = getCssConstant(tokenPrefix, cssName, variant)
      flatTokenMap[cssVar.key] = String(value)
    }
  }

  // Generate CSS declarations string
  const cssDeclarations = Object.entries(flatTokenMap)
    .map(([key, value]) => `${key}: ${value};`)
    .join("\n    ")

  // Create GlobalStyles component that injects variables on :root
  const GlobalStyles = createGlobalStyle`
    :root {
      ${cssDeclarations}
    }
  `

  // Create typed getter function using nice-styles helper
  const getToken = <K extends keyof T, V extends VariantKeys<T[K]>>(
    tokenName: K,
    variant?: V
  ): TokenResult => {
    const tokenPrefix = tokenPrefixMap[tokenName as string] ?? prefix
    return getTokenFromMap(tokenPrefix, tokenMap, tokenName as string, variant as string | undefined)
  }

  return { GlobalStyles, getComponentToken: getToken as GetComponentTokenFn<T> }
}