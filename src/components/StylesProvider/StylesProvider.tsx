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
import { DeviceDetectionProvider } from './DeviceContext'
import { ThemeDetectionProvider } from './ThemeContext'
import { LocaleContextProvider } from './LocaleContext'
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
export function StylesProvider({ children, googleFonts, adobeFonts, links, detectDevice = false, detectTheme = false, locale, dir }: StylesProviderProps) {
  const fontsConfig = useGoogleFontsConfig(googleFonts)
  const adobeConfig = useAdobeFontsConfig(adobeFonts)

  const tree = (
    <ThemeProvider theme={Colors}>
      {fontsConfig && <FontLoader links={fontsConfig.links} />}
      {adobeConfig && <FontLoader links={adobeConfig.links} />}
      {links && links.length > 0 && <FontLoader links={links} />}
      {children}
    </ThemeProvider>
  )

  // Mount each detecting provider only on opt-in, so its environment listener
  // (resize for device, prefers-color-scheme for theme) is registered solely
  // when a consumer reads that value. Without them, useDevice() / useTheme()
  // fall back to their inert defaults (isMobile: false / theme: DEFAULT_THEME).
  let result = tree
  // Publish explicit locale / dir only when given, so a nested StylesProvider
  // without them does not shadow an ancestor's values. No DOM attribute is set.
  if (locale !== undefined || dir !== undefined) {
    result = <LocaleContextProvider locale={locale} dir={dir}>{result}</LocaleContextProvider>
  }
  if (detectTheme) result = <ThemeDetectionProvider>{result}</ThemeDetectionProvider>
  if (detectDevice) result = <DeviceDetectionProvider>{result}</DeviceDetectionProvider>
  return result
}