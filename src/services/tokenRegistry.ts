import {
  Theme,
  getTokenFromMap,
  type TokenDefinition,
  type TokenMap,
  type TokenResult,
} from "nice-styles"

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
  registry.set(name, { prefix: "core", variants: variants as TokenDefinition })
}

/**
 * Check if a token definition uses the legacy name/items format
 */
function isLegacyFormat(def: unknown): def is { name: string; items: TokenDefinition } {
  return typeof def === 'object' && def !== null && 'name' in def && 'items' in def
}

/**
 * Register custom tokens into the unified registry.
 *
 * - Token names that exist in core Theme use "core" prefix (value override)
 * - Custom token names use the provided prefix
 * - When overriding existing tokens, variants are MERGED (not replaced)
 *
 * @param tokenMap - Object mapping token names to variant → value objects
 * @param prefix - CSS variable prefix for custom tokens (default: "app")
 *
 * @example
 * // Override core fontSize (merges with existing variants)
 * registerTokens({ fontSize: { base: "18px" } })
 * // → --core--font-size--base: 18px (other variants preserved)
 *
 * @example
 * // Add custom token
 * registerTokens({ brandColor: { primary: "#f00" } })
 * // → --app--brand-color--primary: #f00
 */
export function registerTokens(tokenMap: TokenMap, prefix = "app"): void {
  for (const [name, variants] of Object.entries(tokenMap)) {
    // Core token names keep "core" prefix (override values only)
    // Custom token names use the provided prefix
    const effectivePrefix = name in Theme ? "core" : prefix

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

    registry.set(name, { prefix: effectivePrefix, variants: mergedVariants })
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