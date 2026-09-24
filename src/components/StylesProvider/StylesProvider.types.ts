/**
 * Type definitions for StylesProvider
 */

import type { ReactNode } from 'react'
import type { GoogleFontsConfig, AdobeFontsConfig, LinkAttributes } from 'nice-styles'
import type { LocaleCodeType, LocaleDirectionType } from './LocaleContext'

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

  /**
   * Run mobile detection and publish it on the StylesProvider context, so
   * descendants read a single shared device state with `useDevice()`. When
   * false (default) no detection runs and `useDevice()` returns the inert
   * default (`{ userAgent: "", mobileUserAgents: MOBILE_USER_AGENTS, isMobile: false }`).
   *
   * @default false
   *
   * @example
   * ```tsx
   * <StylesProvider detectDevice>
   *   <App />
   * </StylesProvider>
   *
   * // any descendant
   * const { isMobile } = useDevice()
   *
   * // override the user-agent list for this call
   * const { isMobile } = useDevice([...MOBILE_USER_AGENTS, "MyKiosk"])
   * ```
   */
  detectDevice?: boolean

  /**
   * Detect the OS color-scheme preference (`prefers-color-scheme: dark`) and
   * publish it on the StylesProvider context, so descendants read a single
   * shared theme name with `useTheme()` — the theme sibling of `detectDevice` /
   * `useDevice()`. When false (default) no detection runs and `useTheme()`
   * returns `{ theme: DEFAULT_THEME }`.
   *
   * Reflects the system preference, not an explicit `<Theme>` pin you apply
   * yourself.
   *
   * @default false
   *
   * @example
   * ```tsx
   * <StylesProvider detectTheme>
   *   <App />
   * </StylesProvider>
   *
   * // any descendant
   * const { theme } = useTheme()
   * ```
   */
  detectTheme?: boolean

  /**
   * Locale published to descendants through `useLocale()`. When absent,
   * `useLocale()` reads `document.documentElement.lang`, then
   * `navigator.language`, then falls back to "en".
   *
   * Does not set `lang` on any element — document language is markup the
   * consumer owns.
   *
   * @example
   * ```tsx
   * <StylesProvider locale="ar-EG">
   *   <App />
   * </StylesProvider>
   * ```
   */
  locale?: LocaleCodeType

  /**
   * Text direction published to descendants through `useLocale()`. When
   * absent, it is taken from `document.documentElement.dir` (only when
   * `locale` is also absent), else derived from the resolved locale.
   *
   * Does not set `dir` on any element — base direction is markup the consumer
   * owns (W3C: never apply base direction with CSS).
   */
  dir?: LocaleDirectionType
}