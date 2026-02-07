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
 * Default mode string value
 */
export const DEFAULT_MODE = "light"

/**
 * Value with mode variants
 * Must include DEFAULT_MODE key, additional modes are optional
 */
export interface ModeValue {
  [mode: string]: string | number
}

/**
 * Check if a value is a mode object (has DEFAULT_MODE key)
 */
export function isModeValue(value: unknown): value is ModeValue {
  return (
    typeof value === "object" &&
    value !== null &&
    DEFAULT_MODE in value &&
    typeof (value as ModeValue)[DEFAULT_MODE] !== "undefined"
  )
}

/**
 * Registry entry storing token variants and their CSS prefix
 */
interface RegistryEntry {
  prefix: string
  variants: Record<string, string | number | ModeValue>
  modes: Set<string>
}

/**
 * Unified token registry - stores all registered tokens (core + custom)
 */
const registry = new Map<string, RegistryEntry>()

/**
 * Extract default mode variants from an entry (for getTokenFromMap compatibility)
 */
function getDefaultVariants(entry: RegistryEntry): TokenDefinition {
  const result: TokenDefinition = {}
  for (const [key, value] of Object.entries(entry.variants)) {
    if (isModeValue(value)) {
      result[key] = value[DEFAULT_MODE]
    } else {
      result[key] = value
    }
  }
  return result
}

// Initialize registry with core tokens
for (const [name, def] of Object.entries(Theme)) {
  registry.set(name, {
    prefix: DEFAULT_PREFIX,
    variants: def as Record<string, string | number>,
    modes: new Set([DEFAULT_MODE]),
  })
}

/**
 * Register tokens into the unified registry.
 *
 * Supports two value formats:
 * - Simple value: `{ base: "16px" }` (default mode only)
 * - Mode value: `{ base: { light: "16px", dark: "18px" } }`
 *
 * @param tokenMap - Object mapping token names to variant → value objects
 * @param prefix - CSS variable prefix (default: "core")
 */
export function registerTokens(
  tokenMap: TokenMap | Record<string, Record<string, string | number | ModeValue>>,
  prefix = DEFAULT_PREFIX
): void {
  for (const [name, variants] of Object.entries(tokenMap)) {
    const existing = registry.get(name)
    const modes = new Set<string>([DEFAULT_MODE])

    for (const value of Object.values(variants)) {
      if (isModeValue(value)) {
        for (const mode of Object.keys(value)) {
          modes.add(mode)
        }
      }
    }

    let mergedVariants: Record<string, string | number | ModeValue>

    if (existing) {
      mergedVariants = { ...existing.variants, ...variants }
      for (const mode of existing.modes) {
        modes.add(mode)
      }
    } else {
      mergedVariants = variants
    }

    registry.set(name, { prefix, variants: mergedVariants, modes })
  }
}

/**
 * Unified token accessor - queries all registered tokens.
 *
 * @param name - The camelCase token name
 * @param variant - The variant key (default: "base")
 * @param mode - Optional theme mode (e.g., "dark")
 * @returns TokenResult with key, var, and value properties
 */
export function getToken(name: string, variant = "base", mode?: string): TokenResult {
  const entry = registry.get(name)
  if (!entry) {
    const available = [...registry.keys()].slice(0, 10).join(", ")
    throw new Error(
      `Token "${name}" not found in registry. ` +
      `Available tokens include: ${available}...`
    )
  }

  const defaultVariants = getDefaultVariants(entry)
  return getTokenFromMap(entry.prefix, { [name]: defaultVariants }, name, variant, mode)
}

/**
 * Get the mode-specific value for a token variant
 */
export function getTokenModeValue(
  name: string,
  variant: string,
  mode: string
): string | number | undefined {
  const entry = registry.get(name)
  if (!entry) return undefined

  const value = entry.variants[variant]
  if (isModeValue(value)) {
    return value[mode]
  }
  return mode === DEFAULT_MODE ? value : undefined
}

/**
 * Get all modes registered for a token
 */
export function getTokenModes(name: string): string[] {
  const entry = registry.get(name)
  return entry ? [...entry.modes] : []
}

/**
 * Check if a token name exists in the registry
 */
export function hasToken(name: string): boolean {
  return registry.has(name)
}

/**
 * Get all variant keys for a registered token
 */
export function getTokenVariants(name: string): string[] {
  const entry = registry.get(name)
  return entry ? Object.keys(entry.variants) : []
}

/**
 * Get all registered token names
 */
export function getTokenNames(): string[] {
  return [...registry.keys()]
}