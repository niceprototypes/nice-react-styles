import { Theme } from "nice-styles"
import { DEFAULT_MODE } from "../styleValues"
import type { ModeValue } from "../ModeValue"
import type { BreakpointValue } from "../BreakpointValue"

/**
 * Registry entry storing token variants and their CSS prefix
 */
export interface RegistryEntry {
  prefix?: string
  variants: Record<string, string | number | ModeValue | BreakpointValue>
  modes: Set<string>
}

/**
 * Unified token registry — stores all registered tokens (core + custom).
 * Internal module-level singleton; mutated only by registerTokens.
 */
export const registry = new Map<string, RegistryEntry>()

// Seed: flat core tokens (animationDuration, gap, borderRadius, etc.)
// Theme exposes these at the top level so no per-dimension reshaping is needed.
for (const [name, def] of Object.entries(Theme)) {
  registry.set(name, {
    variants: def as Record<string, string | number>,
    modes: new Set([DEFAULT_MODE]),
  })
}