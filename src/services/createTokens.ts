import { createGlobalStyle } from "styled-components"
import type { ComponentType } from "react"
import {
  getCssConstant,
  getTokenFromMap,
  type TokenDefinition,
  type TokenMap,
  type TokenResult,
} from "nice-styles"

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
    return getTokenFromMap(component, tokenMap, tokenName as string, variant as string | undefined)
  }

  return { GlobalStyles, getComponentToken: getToken as GetComponentTokenFn<T> }
}