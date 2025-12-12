/**
 * Type definitions for FontLoader
 */

/**
 * Link element attributes for loading external resources
 * Used primarily for Google Fonts preconnect and stylesheet loading
 */
export interface LinkAttributes {
  /** The relationship between the current document and the linked resource */
  rel: 'preconnect' | 'stylesheet' | 'dns-prefetch'
  /** The URL of the linked resource */
  href: string
  /** CORS settings for the fetch (use 'anonymous' for Google Fonts) */
  crossOrigin?: 'anonymous' | 'use-credentials'
  /** Media query for when the stylesheet should apply */
  media?: string
}

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