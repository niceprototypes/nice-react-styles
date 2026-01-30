/**
 * nice-react-styles
 * React provider component for nice-styles CSS variables with styled-components theme support
 */

export { StylesProvider } from './components/StylesProvider'

// Service exports
export { createTokens } from './services/createTokens'
export type { ComponentTokens } from './services/createTokens'

// Token registry - unified token access
export { getToken, registerTokens, hasToken, getTokenNames, DEFAULT_PREFIX } from './services/tokenRegistry'

// Re-export from nice-styles for convenience (low-level utilities)
export { getTokenFromMap } from 'nice-styles'
export type { TokenResult, TokenDefinition, TokenMap } from 'nice-styles'

// Type exports
export type { StylesProviderProps, GoogleFontsConfig } from './components/StylesProvider/types'