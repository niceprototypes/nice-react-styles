/**
 * Type definitions for StylesProvider
 */

import type { ReactNode } from 'react'
import type { GoogleFontsConfig, AdobeFontsConfig, LinkAttributes } from 'nice-styles'

/**
 * Props for the StylesProvider component
 */
export interface StylesProviderProps {
  /**
   * Child components that will have access to nice-styles theme and CSS variables
   */
  children: ReactNode

  /**
   * Optional Google Fonts to load. Provide either a URL string (any standard
   * Google Fonts URL) or a full configuration object.
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
   * Optional Adobe Fonts (Typekit) kit to load.
   * Provide a bare kit id, a full kit stylesheet URL, or a full
   * AdobeFontsConfig object. Loads independently of (and alongside)
   * `googleFonts` — Adobe and Google fonts can be used together.
   *
   * @example Using a kit id:
   * ```tsx
   * <StylesProvider adobeFonts="abc1def">
   *   <App />
   * </StylesProvider>
   * ```
   *
   * @example Using the kit stylesheet URL:
   * ```tsx
   * <StylesProvider adobeFonts="https://use.typekit.net/abc1def.css">
   *   <App />
   * </StylesProvider>
   * ```
   */
  adobeFonts?: string | AdobeFontsConfig

  /**
   * Optional raw `<link>` descriptors for any other font source — self-hosted
   * `@font-face` stylesheets, a non-Google/Adobe CDN, etc. Injected verbatim
   * alongside `googleFonts` / `adobeFonts`. Mirrors the `links` field of the
   * JS-only `injectFonts`.
   *
   * @example Self-hosted font stylesheet:
   * ```tsx
   * <StylesProvider links={[{ rel: "stylesheet", href: "/fonts/avenir.css" }]}>
   *   <App />
   * </StylesProvider>
   * ```
   */
  links?: LinkAttributes[]
}