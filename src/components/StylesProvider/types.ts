/**
 * Type definitions for StylesProvider
 */

import type { ComponentType, ReactNode } from 'react'
import type { LinkAttributes } from '../FontLoader/types'
import type { GoogleFontMetadata } from '../FontFaceStyles/types'

/**
 * Configuration for loading Google Fonts
 * Passed to StylesProvider to enable dynamic font loading
 */
export interface GoogleFontsConfig {
  /**
   * Array of link elements to inject into the document head
   * Typically includes:
   * 1. Preconnect to fonts.googleapis.com
   * 2. Preconnect to fonts.gstatic.com (with crossorigin)
   * 3. Stylesheet link to the Google Fonts CSS
   *
   * @example
   * ```tsx
   * const links: LinkAttributes[] = [
   *   { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
   *   { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
   *   { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=...' }
   * ]
   * ```
   */
  links: LinkAttributes[]

  /**
   * Optional: Generate @font-face declarations for specific font weights
   * If provided, will create granular @font-face rules mapped to nice-styles fontWeight tokens
   *
   * This is parsed automatically from the Google Fonts URL if not provided
   */
  fonts?: GoogleFontMetadata[]
}

/**
 * Props for the StylesProvider component
 */
export interface StylesProviderProps {
  /**
   * Child components that will have access to nice-styles theme and CSS variables
   */
  children: ReactNode

  /**
   * Enable loading of default nice-styles fonts
   * When true, loads Google Sans Flex (base/heading) and Roboto Mono (code)
   * When false (default), no fonts are loaded
   *
   * @default false
   *
   * @example Enable default fonts:
   * ```tsx
   * <StylesProvider loadFonts>
   *   <App />
   * </StylesProvider>
   * ```
   */
  loadFonts?: boolean

  /**
   * Optional Google Fonts configuration (overrides loadFonts)
   * Provide either a URL string or a full configuration object
   * If provided, this takes precedence over the loadFonts prop
   *
   * @example Using URL string:
   * ```tsx
   * <StylesProvider googleFonts="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap">
   *   <App />
   * </StylesProvider>
   * ```
   *
   * @example Using manual configuration:
   * ```tsx
   * <StylesProvider googleFonts={{
   *   links: [
   *     { rel: 'preconnect', href: 'https://fonts.googleapis.com' },
   *     { rel: 'preconnect', href: 'https://fonts.gstatic.com', crossOrigin: 'anonymous' },
   *     { rel: 'stylesheet', href: 'https://fonts.googleapis.com/css2?family=...' }
   *   ]
   * }}>
   *   <App />
   * </StylesProvider>
   * ```
   */
  googleFonts?: string | GoogleFontsConfig

  /**
   * Array of GlobalStyles components from nice-react-* component libraries
   * These inject component-level CSS custom properties on :root
   *
   * @example
   * ```tsx
   * import { ButtonStyles } from 'nice-react-button'
   * import { IconStyles } from 'nice-react-icon'
   *
   * <StylesProvider componentStyles={[ButtonStyles, IconStyles]}>
   *   <App />
   * </StylesProvider>
   * ```
   */
  componentStyles?: ComponentType[]
}