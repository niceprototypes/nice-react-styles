/**
 * Type definitions for FontLoader
 */

import type { LinkAttributes } from 'nice-styles'

/**
 * Props for FontLoader component
 */
export interface FontLoaderProps {
  /**
   * Array of link elements to inject into the document head
   * Typically includes preconnect links and stylesheet link
   */
  links: LinkAttributes[]
}