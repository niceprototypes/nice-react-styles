import { colorTokensData, sizeTokensData, BREAKPOINT_PHONE } from "nice-styles"
import { DEFAULT_MODE } from "../styleValues"
import { registry } from "./createRegistry"
import { seedDimensionedTokens } from "./seedDimensionedTokens"

// Re-export the registry singleton and its entry type from this barrel so
// service consumers can keep importing `registry` / `RegistryEntry` from a
// single, predictable location.
export { registry } from "./createRegistry"
export type { RegistryEntry } from "./createRegistry"

// Seed: dimensioned token modules.
// - colorTokensData is keyed by mode (day, night). The mode keys ARE modes, so they're recorded on each entry's `modes` Set.
// - sizeTokensData is keyed by breakpoint (phone, tablet, laptop, desktop). Breakpoints are NOT modes, so each entry keeps `modes` at DEFAULT_MODE only.
seedDimensionedTokens(registry, [
  {
    data: colorTokensData as unknown as Record<string, Record<string, Record<string, string>>>,
    defaultDim: DEFAULT_MODE,
    modesForEntry: new Set(Object.keys(colorTokensData)),
  },
  {
    data: sizeTokensData as unknown as Record<string, Record<string, Record<string, string>>>,
    defaultDim: BREAKPOINT_PHONE,
    modesForEntry: new Set([DEFAULT_MODE]),
  },
])
