import { createGlobalStyle } from "styled-components"
import type { ComponentType } from "react"
import { getCssConstant } from "nice-styles"

/**
 * Token definition following the nice-styles pattern
 * Each token has a CSS name and a map of variant keys to values
 */
interface TokenDefinition {
  name: string
  items: Record<string, string>
}

/**
 * Token map structure matching nice-styles tokens.json format
 * Keys are camelCase token names, values are TokenDefinition objects
 */
type TokenMap = Record<string, TokenDefinition>

/**
 * Result object returned by the getToken function
 * Mirrors the structure of nice-styles getToken for consistency
 */
export interface TokenResult {
  /**
   * The full CSS variable name without var() wrapper
   * @example "--icon--stroke-width--small"
   */
  key: string

  /**
   * The CSS variable wrapped in var() for use in CSS
   * @example "var(--icon--stroke-width--small)"
   */
  var: string

  /**
   * The raw token value as defined in the token map
   * @example "1.5px"
   */
  value: string
}

/**
 * Extracts variant keys from a TokenDefinition's items
 */
type VariantKeys<T extends TokenDefinition> = keyof T["items"]

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
interface ComponentTokens<T extends TokenMap> {
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
 * Token structure mirrors nice-styles tokens.json format:
 * - Keys are camelCase token names
 * - Values have `name` (CSS name) and `items` (variant → value map)
 *
 * @param component - Component prefix for CSS variable names (e.g., "icon", "button")
 * @param tokenMap - Object mapping token names to their definitions
 *
 * @returns ComponentTokens object containing:
 *          - GlobalStyles: Component for injection via StylesProvider
 *          - getComponentToken: Typed accessor function for retrieving token values
 *
 * @example
 * // Define component tokens (e.g., Icon.tokens.ts)
 * import { createTokens } from "nice-react-styles"
 *
 * const IconTokenMap = {
 *   strokeWidth: {
 *     name: "stroke-width",
 *     items: {
 *       small: "1px",
 *       base: "1.5px",
 *       large: "8px",
 *     }
 *   },
 *   spinningAnimationDuration: {
 *     name: "spinning-animation-duration",
 *     items: {
 *       base: "750ms",
 *     }
 *   }
 * } as const
 *
 * export const { GlobalStyles: IconStyles, getComponentToken: getIconToken } = createTokens("icon", IconTokenMap)
 *
 * @example
 * // Use typed getComponentToken in styled-components
 * import { getIconToken } from "./tokens"
 *
 * const IconWrapper = styled.div`
 *   stroke-width: ${getIconToken("strokeWidth", "base").var};
 * `
 */
export function createTokens<T extends TokenMap>(
  component: string,
  tokenMap: T
): ComponentTokens<T> {
  // Build flattened CSS variable map using standardized format: --{pkg}--{token}--{param}
  const flatTokenMap: Record<string, string> = {}

  for (const [_tokenName, definition] of Object.entries(tokenMap)) {
    const { name, items } = definition
    for (const [variant, value] of Object.entries(items)) {
      const cssVar = getCssConstant(component, name, variant)
      flatTokenMap[cssVar.key] = value
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

  // Create typed getter function
  const getToken = <K extends keyof T, V extends VariantKeys<T[K]>>(
    tokenName: K,
    variant?: V
  ): TokenResult => {
    const definition = tokenMap[tokenName]
    if (!definition) {
      throw new Error(
        `Token "${String(tokenName)}" not found in ${component} tokens. ` +
        `Available tokens: ${Object.keys(tokenMap).join(", ")}`
      )
    }

    // If no variant provided, use "base" as default
    const variantKey = (variant ?? "base") as string
    const value = definition.items[variantKey]

    if (value === undefined) {
      throw new Error(
        `Variant "${variantKey}" not found for token "${String(tokenName)}" in ${component} tokens. ` +
        `Available variants: ${Object.keys(definition.items).join(", ")}`
      )
    }

    const cssVar = getCssConstant(component, definition.name, variantKey)

    return {
      key: cssVar.key,
      var: cssVar.var,
      value,
    }
  }

  return { GlobalStyles, getComponentToken: getToken as GetComponentTokenFn<T> }
}