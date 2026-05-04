/**
 * Value with mode variants (day/night theming).
 * Must include DEFAULT_MODE key, additional modes are optional.
 */
export interface ModeValue {
  [mode: string]: string | number
}