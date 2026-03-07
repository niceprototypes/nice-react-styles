/**
 * nice-react-styles
 * React provider component for nice-styles CSS variables with styled-components theme support
 */

export { StylesProvider } from './components/StylesProvider'

// Service exports
export { createTokens } from './services/createTokens'
export type { ComponentTokens } from './services/createTokens'

// Token registry - unified token access
export {
  getToken,
  registerTokens,
  hasToken,
  getTokenNames,
  getTokenVariants,
  getTokenModes,
  getTokenModeValue,
  isModeValue,
  DEFAULT_MODE,
} from './services/tokenRegistry'
export type { ModeValue } from './services/tokenRegistry'

// Re-export from nice-styles for convenience
export { getComponentToken } from 'nice-styles'
export type { TokenResult, ComponentPrefix } from 'nice-styles'

// Type exports
export type { StylesProviderProps } from './components/StylesProvider/types'
export type { GoogleFontsConfig, LinkAttributes, GoogleFontMetadata, FontAxis } from './types'