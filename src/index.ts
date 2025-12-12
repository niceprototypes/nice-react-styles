/**
 * nice-react-styles
 * React provider component for nice-styles CSS variables with styled-components theme support
 */

export { StylesProvider } from './components/StylesProvider'

// Service exports
export { createTokens } from './services/createTokens'

// Re-export getToken from nice-styles for convenience
export { getToken } from 'nice-styles'

// Type exports
export type { TokenResult } from './services/createTokens'
export type { StylesProviderProps, GoogleFontsConfig } from './components/StylesProvider/types'