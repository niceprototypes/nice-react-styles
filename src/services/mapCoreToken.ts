import { getToken, getTokenVariants } from "./tokenRegistry"

/**
 * Maps all variants of a core token to var() references for use in component token maps.
 *
 * Reads the registry to discover all variants, then generates the mapping automatically.
 * This eliminates manual enumeration of variants when creating component-level tokens.
 *
 * @param tokenName - The core token name (e.g., "backgroundColor", "foregroundColor")
 * @returns Object mapping each variant to its var() reference
 *
 * @example
 * // Instead of manually listing variants:
 * // backgroundColor: {
 * //   base: getToken("backgroundColor").var,
 * //   alternate: getToken("backgroundColor", "alternate").var,
 * // }
 *
 * // Auto-map all variants:
 * const TileTokenMap = {
 *   backgroundColor: mapCoreToken("backgroundColor"),
 *   foregroundColor: mapCoreToken("foregroundColor"),
 * } as const
 */
export function mapCoreToken(tokenName: string): Record<string, string> {
  const variants = getTokenVariants(tokenName)
  const result: Record<string, string> = {}
  for (const variant of variants) {
    result[variant] = getToken(tokenName, variant).var
  }
  return result
}