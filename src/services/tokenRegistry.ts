 import {
  Theme,
  getTokenFromMap,
  BREAKPOINT_SMALL,
  type TokenDefinition,
  type TokenMap,
  type TokenResult,
} from "nice-styles"

/**
 * Default mode string value
 */
export const DEFAULT_MODE = "day"

/**
 * Default breakpoint string value — small-first, so small is the base
 */
export const DEFAULT_BREAKPOINT = BREAKPOINT_SMALL

/**
 * Value with mode variants (day/night theming).
 * Must include DEFAULT_MODE key, additional modes are optional.
 */
export interface ModeValue {
  [mode: string]: string | number
}

/**
 * Value with breakpoint variants (responsive sizing).
 * Must include DEFAULT_BREAKPOINT key, additional breakpoints are optional.
 * Mutually exclusive with ModeValue on the same token variant.
 */
export interface BreakpointValue {
  [breakpoint: string]: string | number
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
 * Check if a value is a breakpoint object (has DEFAULT_BREAKPOINT key).
 * Checked before isModeValue — if a value has both "small" and "day" keys,
 * it is treated as a breakpoint value.
 */
export function isBreakpointValue(value: unknown): value is BreakpointValue {
  return (
    typeof value === "object" &&
    value !== null &&
    DEFAULT_BREAKPOINT in value &&
    typeof (value as BreakpointValue)[DEFAULT_BREAKPOINT] !== "undefined"
  )
}

/**
 * Registry entry storing token variants and their CSS prefix
 */
interface RegistryEntry {
  prefix?: string
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
    variants: def as Record<string, string | number>,
    modes: new Set([DEFAULT_MODE]),
  })
}

/**
 * Register tokens into the unified registry.
 *
 * Supports two value formats:
 * - Simple value: `{ base: "16px" }` (default mode only)
 * - Mode value: `{ base: { day: "16px", night: "18px" } }`
 *
 * @param tokenMap - Object mapping token names to variant → value objects
 * @param prefix - Optional component prefix for CSS variables (e.g., "button", "tile")
 */
export function registerTokens(
  tokenMap: TokenMap | Record<string, Record<string, string | number | ModeValue>>,
  prefix?: string
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
  if (entry) {
    const defaultVariants = getDefaultVariants(entry)
    return getTokenFromMap({ [name]: defaultVariants }, name, variant, { mode, prefix: entry.prefix })
  }
  // Fallback: construct CSS var for unregistered tokens (namespace "np" still applied by getConstant)
  return getTokenFromMap({ [name]: { [variant]: "" } }, name, variant, { mode })
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