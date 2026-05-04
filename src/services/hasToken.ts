import { registry } from "../utilities/registry"

/**
 * Check if a token name exists in the registry
 */
export function hasToken(name: string): boolean {
  return registry.has(name)
}