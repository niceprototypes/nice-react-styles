/**
 * nice-react-styles
 * React provider component for nice-styles CSS variables with styled-components theme support
 */

export { StylesProvider } from './components/StylesProvider'

// Service exports
export { createTokens } from './services/createTokens'
export type { ComponentTokens } from './services/createTokens'

// Re-export from nice-styles for convenience
export { getToken, getTokenFromMap } from 'nice-styles'
export type { TokenResult, TokenDefinition, TokenMap } from 'nice-styles'

// Type exports
export type { StylesProviderProps, GoogleFontsConfig } from './components/StylesProvider/types'