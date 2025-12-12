/**
 * Type definitions for FontFaceStyles
 */

/**
 * Variable font axis configuration
 * Represents a single axis in a variable font (e.g., wght, opsz, ROND)
 */
export interface FontAxis {
  /** The axis tag (e.g., 'wght', 'opsz', 'ROND', 'slnt') */
  tag: string
  /** Minimum value for this axis */
  min: number
  /** Maximum value for this axis */
  max: number
  /** Default/preferred value for this axis */
  default?: number
}

/**
 * Parsed metadata from a Google Fonts URL
 * Contains all information needed to generate @font-face rules
 */
export interface GoogleFontMetadata {
  /** The font family name (e.g., 'Google Sans Flex') */
  family: string
  /** Variable font axes with their ranges */
  axes: FontAxis[]
  /** Display strategy (swap, block, fallback, optional) */
  display?: 'swap' | 'block' | 'fallback' | 'optional'
  /** The original Google Fonts CSS URL */
  cssUrl: string
}

/**
 * Props for FontFaceStyles component
 */
export interface FontFaceStylesProps {
  /**
   * Font metadata parsed from Google Fonts URL
   */
  metadata: GoogleFontMetadata
}