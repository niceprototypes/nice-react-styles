/**
 * React-specific shared types for nice-react-styles.
 */

import type { BreakpointName } from "nice-styles"

/**
 * Generic responsive prop shape used across component packages.
 *
 * A prop typed `Breakpoints<T>` accepts either a bare value applied at every
 * breakpoint, or an object mapping breakpoint names ("phone" / "tablet" /
 * "laptop" / "desktop") to per-breakpoint values. Components emit
 * per-breakpoint CSS (or pass to a responsive helper) based on which keys
 * are present.
 *
 * Example:
 *   gap?: Breakpoints<GapType>
 *   // accepts: "base" | { phone: "none", tablet: "base", laptop: "large", desktop: "larger" }
 */
export type Breakpoints<T> = T | { [B in BreakpointName]?: T }
