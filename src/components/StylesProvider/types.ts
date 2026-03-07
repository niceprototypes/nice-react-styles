/**
 * Type definitions for StylesProvider
 */

import type { ComponentType, ReactNode } from 'react'
import type { GoogleFontsConfig } from '../../types'

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