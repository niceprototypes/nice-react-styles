import { getTokenFromMap, type TokenDefinition, type TokenResult } from "nice-styles"
import { DEFAULT_MODE } from "./styleValues"
import { isStyleValue } from "./isStyleValue"
import { registry, type RegistryEntry } from "./registry"

/**
 * Extract default mode variants from an entry (for getTokenFromMap compatibility)
 */
function getDefaultVariants(entry: RegistryEntry): TokenDefinition {
  const result: TokenDefinition = {}
  for (const [key, value] of Object.entries(entry.variants)) {
    if (isStyleValue("mode", value)) {
      result[key] = value[DEFAULT_MODE]
    } else {
      result[key] = value
    }
  }
  return result
}

/**
 * Internal — resolves a token through the registry and returns the full
 * { key, var, value } TokenResult. Shared by all three public getters.
 */
function resolveReactToken(name: string, variant: string, mode?: string): TokenResult {
  const entry = registry.get(name)
  if (entry) {
    const defaultVariants = getDefaultVariants(entry)
    return getTokenFromMap({ [name]: defaultVariants }, name, variant, { mode, prefix: entry.prefix })
  }
  // Fallback: construct CSS var for unregistered tokens (namespace "np" still applied by getConstant)
  return getTokenFromMap({ [name]: { [variant]: "" } }, name, variant, { mode })
}

/**
 * Unified token accessor — queries all registered tokens.
 *
 * @param name - The camelCase token name
 * @param variant - The variant key (default: "base")
 * @param mode - Optional theme mode (e.g., "dark")
 * @returns TokenResult with key, var, and value properties
 */
export function getReactToken(name: string, variant = "base", mode?: string): TokenResult {
  return resolveReactToken(name, variant, mode)
}

/**
 * Returns the CSS variable name (no `var(...)` wrapper) for a registered token.
 *
 * @example getReactTokenKey("fontSize") // → "--np--font-size--base"
 */
export function getReactTokenKey(name: string, variant = "base", mode?: string): string {
  return resolveReactToken(name, variant, mode).key
}

/**
 * Returns the raw token value (e.g. "16px", a font-family string, an hsla color)
 * for a registered token. Use when CSS needs the literal value, not the `var(...)`
 * reference — e.g. `parseInt` on an animation duration, or font strings passed to
 * a chart library.
 *
 * @example getReactTokenValue("fontFamily", "base") // → "Inter, sans-serif"
 */
export function getReactTokenValue(name: string, variant = "base", mode?: string): string {
  return resolveReactToken(name, variant, mode).value
}