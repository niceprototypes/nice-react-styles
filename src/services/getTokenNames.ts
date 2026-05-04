import { registry } from "../utilities/registry"

/**
 * Get all registered token names
 */
export function getTokenNames(): string[] {
  return [...registry.keys()]
}