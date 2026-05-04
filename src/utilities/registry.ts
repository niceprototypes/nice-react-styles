import { Theme } from "nice-styles"
import { DEFAULT_MODE } from "../services/styleValues"
import type { ModeValue } from "../services/ModeValue"

/**
 * Registry entry storing token variants and their CSS prefix
 */
export interface RegistryEntry {
  prefix?: string
  variants: Record<string, string | number | ModeValue>
  modes: Set<string>
}

/**
 * Unified token registry — stores all registered tokens (core + custom).
 * Internal module-level singleton; mutated only by registerTokens.
 */
export const registry = new Map<string, RegistryEntry>()

// Initialize registry with core tokens
for (const [name, def] of Object.entries(Theme)) {
  registry.set(name, {
    variants: def as Record<string, string | number>,
    modes: new Set([DEFAULT_MODE]),
  })
}
