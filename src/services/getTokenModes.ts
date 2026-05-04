import { registry } from "../utilities/registry"

/**
 * Get all modes registered for a token
 */
export function getTokenModes(name: string): string[] {
  const entry = registry.get(name)
  return entry ? [...entry.modes] : []
}