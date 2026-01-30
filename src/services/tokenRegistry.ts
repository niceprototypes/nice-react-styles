import {
  Theme,
  getTokenFromMap,
  type TokenDefinition,
  type TokenMap,
  type TokenResult,
} from "nice-styles"

/**
 * Default prefix for core design tokens
 */
export const DEFAULT_PREFIX = "core"

/**
 * Registry entry storing token variants and their CSS prefix
 */
interface RegistryEntry {
  prefix: string
  variants: TokenDefinition
}

/**
 * Unified token registry - stores all registered tokens (core + custom)
 * Initialized with core Theme tokens on module load
 */
const registry = new Map<string, RegistryEntry>()

// Initialize registry with core tokens
for (const [name, variants] of Object.entries(Theme)) {
  registry.set(name, { prefix: DEFAULT_PREFIX, variants: variants as TokenDefinition })
}

/**
 * Check if a token definition uses the legacy name/items format
 */
function isLegacyFormat(def: unknown): def is { name: string; items: TokenDefinition } {
  return typeof def === 'object' && def !== null && 'name' in def && 'items' in def
}

/**
 * Register tokens into the unified registry.
 *
 * When overriding existing tokens, variants are MERGED (not replaced).
 *
 * @param tokenMap - Object mapping token names to variant → value objects
 * @param prefix - CSS variable prefix (default: "core")
 *
 * @example
 * // Override core fontSize (merges with existing variants)
 * registerTokens({ fontSize: { base: "18px" } })
 * // → --core--font-size--base: 18px (other variants preserved)
 *
 * @example
 * // Add custom token with explicit prefix
 * registerTokens({ brandColor: { primary: "#f00" } }, "app")
 * // → --app--brand-color--primary: #f00
 */
export function registerTokens(tokenMap: TokenMap, prefix = DEFAULT_PREFIX): void {
  for (const [name, variants] of Object.entries(tokenMap)) {
    // Merge with existing variants if token already exists
    const existing = registry.get(name)
    let mergedVariants: TokenDefinition

    if (existing) {
      // Extract variants from existing entry (handle legacy format from Theme)
      const existingVariants = isLegacyFormat(existing.variants)
        ? existing.variants.items
        : existing.variants
      mergedVariants = { ...existingVariants, ...variants }
    } else {
      mergedVariants = variants
    }

    registry.set(name, { prefix, variants: mergedVariants })
  }
}

/**
 * Unified token accessor - queries all registered tokens.
 *
 * Works immediately with core tokens. Custom tokens become available
 * after calling registerTokens() or createTokens().
 *
 * @param name - The camelCase token name (e.g., "fontSize", "brandColor")
 * @param variant - The variant key (default: "base")
 * @returns TokenResult with key, var, and value properties
 * @throws Error if token name is not found in registry
 *
 * @example
 * // Core token (always available)
 * getToken("fontSize", "base")
 * // → { key: "--core--font-size--base", var: "var(--core--font-size--base)", value: "16px" }
 *
 * @example
 * // Custom token (after registration)
 * getToken("brandColor", "primary")
 * // → { key: "--app--brand-color--primary", var: "var(--app--brand-color--primary)", value: "#f00" }
 */
export function getToken(name: string, variant = "base"): TokenResult {
  const entry = registry.get(name)
  if (!entry) {
    const available = [...registry.keys()].slice(0, 10).join(", ")
    throw new Error(
      `Token "${name}" not found in registry. ` +
      `Available tokens include: ${available}...`
    )
  }
  return getTokenFromMap(entry.prefix, { [name]: entry.variants }, name, variant)
}

/**
 * Check if a token name exists in the registry
 */
export function hasToken(name: string): boolean {
  return registry.has(name)
}

/**
 * Get all registered token names
 */
export function getTokenNames(): string[] {
  return [...registry.keys()]
}