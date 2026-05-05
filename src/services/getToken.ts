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
 * Unified token accessor — queries all registered tokens.
 *
 * @param name - The camelCase token name
 * @param variant - The variant key (default: "base")
 * @param mode - Optional theme mode (e.g., "dark")
 * @returns TokenResult with key, var, and value properties
 */
export function getToken(name: string, variant = "base", mode?: string): TokenResult {
  const entry = registry.get(name)
  if (entry) {
    const defaultVariants = getDefaultVariants(entry)
    return getTokenFromMap({ [name]: defaultVariants }, name, variant, { mode, prefix: entry.prefix })
  }
  // Fallback: construct CSS var for unregistered tokens (namespace "np" still applied by getConstant)
  return getTokenFromMap({ [name]: { [variant]: "" } }, name, variant, { mode })
}