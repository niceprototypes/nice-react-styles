/**
 * StylesProvider Component
 *
 * A wrapper component that provides nice-styles CSS variables and theme to the component tree.
 * Uses styled-components ThemeProvider to make design tokens available via props.theme.
 * Includes both current and deprecated CSS variables for backward compatibility.
 */

import { useMemo } from 'react'
import { Theme } from 'nice-styles'
import { FontLoader } from '../FontLoader'
import { parseGoogleFontsUrl } from '../../services/parseFontUrl'
import { ThemeProvider } from './styled'
import type { StylesProviderProps, GoogleFontsConfig } from './types'
import type { LinkAttributes } from '../FontLoader/types'
import 'nice-styles/variables.css'
import 'nice-styles/deprecated.css'

/**
 * Default Google Sans Flex configuration
 * This is the font used by nice-styles for FONT_FAMILY_BASE and FONT_FAMILY_HEADING
 */
const DEFAULT_BASE_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght,ROND@6..144,1..1000,37&display=swap'

/**
 * Default Roboto Mono configuration
 * This is the font used by nice-styles for FONT_FAMILY_CODE
 */
const DEFAULT_CODE_FONT_URL =
  'https://fonts.googleapis.com/css2?family=Roboto+Mono:wght@100..700&display=swap'

/**
 * Processes googleFonts prop into a normalized GoogleFontsConfig
 */
function useGoogleFontsConfig(
  loadFonts?: boolean,
  googleFonts?: string | GoogleFontsConfig
): GoogleFontsConfig | null {
  return useMemo(() => {
    // Priority 1: If googleFonts is explicitly provided, use it
    if (googleFonts) {
      // If it's already a config object, return it
      if (typeof googleFonts === 'object') {
        return googleFonts
      }

      // If it's a URL string, parse it and generate config
      const metadata = parseGoogleFontsUrl(googleFonts)
      if (!metadata) {
        console.error('Failed to parse Google Fonts URL:', googleFonts)
        return null
      }

      // Generate link elements for optimal loading
      const links: LinkAttributes[] = [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossOrigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: googleFonts,
        },
      ]

      return {
        links,
        fonts: [metadata],
      }
    }

    // Priority 2: If loadFonts is true, use default Google Sans Flex and Roboto Mono
    if (loadFonts) {
      const baseFontMetadata = parseGoogleFontsUrl(DEFAULT_BASE_FONT_URL)
      const codeFontMetadata = parseGoogleFontsUrl(DEFAULT_CODE_FONT_URL)

      if (!baseFontMetadata || !codeFontMetadata) {
        console.error('Failed to parse default Google Fonts configuration')
        return null
      }

      const links: LinkAttributes[] = [
        {
          rel: 'preconnect',
          href: 'https://fonts.googleapis.com',
        },
        {
          rel: 'preconnect',
          href: 'https://fonts.gstatic.com',
          crossOrigin: 'anonymous',
        },
        {
          rel: 'stylesheet',
          href: DEFAULT_BASE_FONT_URL,
        },
        {
          rel: 'stylesheet',
          href: DEFAULT_CODE_FONT_URL,
        },
      ]

      return {
        links,
        fonts: [baseFontMetadata, codeFontMetadata],
      }
    }

    // Priority 3: No fonts
    return null
  }, [loadFonts, googleFonts])
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
 * @example With default fonts (Google Sans Flex + Roboto Mono):
 * ```tsx
 * <StylesProvider loadFonts>
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
 */
export function StylesProvider({ children, loadFonts, googleFonts, componentStyles }: StylesProviderProps) {
  const fontsConfig = useGoogleFontsConfig(loadFonts, googleFonts)

  return (
    <ThemeProvider theme={Theme}>
      {/* Load Google Fonts if configured */}
      {fontsConfig && <FontLoader links={fontsConfig.links} />}
      {/* Render component GlobalStyles */}
      {componentStyles?.map((ComponentStyle, index) => (
        <ComponentStyle key={index} />
      ))}
      {children}
    </ThemeProvider>
  )
}