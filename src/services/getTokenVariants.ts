import { registry } from "../utilities/registry"

/**
 * Get all variant keys for a registered token
 */
export function getTokenVariants(name: string): string[] {
  const entry = registry.get(name)
  return entry ? Object.keys(entry.variants) : []
}