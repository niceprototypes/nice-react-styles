import { BREAKPOINT_SMALL, BREAKPOINT_MEDIUM, BREAKPOINT_LARGE } from "nice-styles"

/**
 * Default mode string value
 */
export const DEFAULT_MODE = "day"

/**
 * Default breakpoint string value — small-first, so small is the base
 */
export const DEFAULT_BREAKPOINT = BREAKPOINT_SMALL

/**
 * Valid keys per style-value kind. The first entry is the discriminator
 * (default key) — its presence on a value identifies the value as belonging
 * to this kind.
 */
export const STYLE_VALUE_KEYS = {
  mode: [DEFAULT_MODE, "night"],
  breakpoint: [DEFAULT_BREAKPOINT, BREAKPOINT_MEDIUM, BREAKPOINT_LARGE],
} as const

export type StyleValueKind = keyof typeof STYLE_VALUE_KEYS