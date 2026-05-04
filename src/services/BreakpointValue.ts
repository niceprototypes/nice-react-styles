/**
 * Value with breakpoint variants (responsive sizing).
 * Must include DEFAULT_BREAKPOINT key, additional breakpoints are optional.
 * Mutually exclusive with ModeValue on the same token variant.
 */
export interface BreakpointValue {
  [breakpoint: string]: string | number
}