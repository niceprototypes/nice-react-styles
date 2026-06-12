/**
 * StylesProvider Component
 *
 * A wrapper component that provides nice-styles CSS variables and theme to the component tree.
 * Uses styled-components ThemeProvider to make design tokens available via props.theme.
 */

import { useMemo } from 'react'
import {
  Colors,
  buildGoogleFontsConfig,
  buildAdobeFontsConfig,
  type GoogleFontsConfig,
  type AdobeFontsConfig,
} from 'nice-styles'
import { FontLoader } from '../FontLoader'
import { ThemeProvider } from './StylesProvider.styled'
import type { StylesProviderProps } from './StylesProvider.types'
import 'nice-styles/tokens.css'

/**
 * Memoizes the googleFonts prop into a normalized GoogleFontsConfig.
 *
 * Link-building lives in nice-styles (`buildGoogleFontsConfig`) so the React
 * provider and the JS-only `injectFonts` path share one implementation.
 */
function useGoogleFontsConfig(
  googleFonts?: string | GoogleFontsConfig
): GoogleFontsConfig | null {
  return useMemo(
    () => (googleFonts ? buildGoogleFontsConfig(googleFonts) : null),
    [googleFonts]
  )
}

/**
 * Memoizes the adobeFonts prop into a normalized AdobeFontsConfig.
 *
 * Link-building lives in nice-styles (`buildAdobeFontsConfig`), shared with the
 * JS-only `injectFonts` path.
 */
function useAdobeFontsConfig(
  adobeFonts?: string | AdobeFontsConfig
): AdobeFontsConfig | null {
  return useMemo(
    () => (adobeFonts ? buildAdobeFontsConfig(adobeFonts) : null),
    [adobeFonts]
  )
}

/**
 * StylesProvider Component
 *
 * @example Basic usage (no fonts):
 * ```tsx
 * import { StylesProvider } from 'nice-react-styles'
 *
 * function App() {
 *   return (
 *     <StylesProvider>
 *       <YourComponent />
 *     </StylesProvider>
 *   )
 * }
 * ```
 *
 * @example With the Nice default fonts (Google Sans Flex + Roboto Mono):
 * ```tsx
 * <StylesProvider googleFonts="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght,ROND@6..144,1..1000,37&family=Roboto+Mono:wght@100..700&display=swap">
 *   <App />
 * </StylesProvider>
 * ```
 *
 * @example With custom Google Fonts:
 * ```tsx
 * <StylesProvider googleFonts="https://fonts.googleapis.com/css2?family=Inter:wght@400;700&display=swap">
 *   <App />
 * </StylesProvider>
 * ```
 *
 * @example With an Adobe Fonts (Typekit) kit:
 * ```tsx
 * <StylesProvider adobeFonts="abc1def">
 *   <App />
 * </StylesProvider>
 * ```
 */
export function StylesProvider({ children, googleFonts, adobeFonts }: StylesProviderProps) {
  const fontsConfig = useGoogleFontsConfig(googleFonts)
  const adobeConfig = useAdobeFontsConfig(adobeFonts)

  return (
    <ThemeProvider theme={Colors}>
      {fontsConfig && <FontLoader links={fontsConfig.links} />}
      {adobeConfig && <FontLoader links={adobeConfig.links} />}
      {children}
    </ThemeProvider>
  )
}