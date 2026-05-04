import { DEFAULT_MODE } from "./styleValues"
import { isStyleValue } from "./isStyleValue"
import { registry } from "../utilities/registry"

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
  if (isStyleValue("mode", value)) {
    return value[mode]
  }
  return mode === DEFAULT_MODE ? value : undefined
}
