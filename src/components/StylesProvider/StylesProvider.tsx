/**
 * StylesProvider Component
 *
 * A wrapper component that provides nice-styles CSS variables and theme to the component tree.
 * Uses styled-components ThemeProvider to make design tokens available via props.theme.
 */

import { useMemo } from 'react'
import {
  Colors,
  parseGoogleFontsUrl,
  parseAdobeFontsUrl,
  type GoogleFontsConfig,
  type AdobeFontsConfig,
  type LinkAttributes,
} from 'nice-styles'
import { FontLoader } from '../FontLoader'
import { ThemeProvider } from './StylesProvider.styled'
import type { StylesProviderProps } from './StylesProvider.types'
import 'nice-styles/tokens.css'

/**
 * Processes googleFonts prop into a normalized GoogleFontsConfig
 */
function useGoogleFontsConfig(
  googleFonts?: string | GoogleFontsConfig
): GoogleFontsConfig | null {
  return useMemo(() => {
    // If googleFonts is provided, build its link set
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

    // No googleFonts → no fonts loaded
    return null
  }, [googleFonts])
}

/**
 * Processes adobeFonts prop into a normalized AdobeFontsConfig.
 *
 * Mirrors useGoogleFontsConfig. Adobe Fonts ships every @font-face in the kit
 * stylesheet, so this only resolves the kit id and emits the preconnect +
 * stylesheet links — no axis parsing.
 */
function useAdobeFontsConfig(
  adobeFonts?: string | AdobeFontsConfig
): AdobeFontsConfig | null {
  return useMemo(() => {
    if (!adobeFonts) return null

    // Already a config object — pass through.
    if (typeof adobeFonts === 'object') {
      return adobeFonts
    }

    // Kit id or URL string — parse and build the kit links.
    const metadata = parseAdobeFontsUrl(adobeFonts)
    if (!metadata) {
      console.error('Failed to parse Adobe Fonts kit reference:', adobeFonts)
      return null
    }

    const links: LinkAttributes[] = [
      {
        rel: 'preconnect',
        href: 'https://use.typekit.net',
      },
      {
        rel: 'preconnect',
        href: 'https://p.typekit.net',
        crossOrigin: 'anonymous',
      },
      {
        rel: 'stylesheet',
        href: metadata.cssUrl,
      },
    ]

    return {
      links,
      fonts: [metadata],
    }
  }, [adobeFonts])
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