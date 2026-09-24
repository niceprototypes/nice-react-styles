/**
 * Locale context for StylesProvider
 *
 * Makes the text direction and locale available to JavaScript — the behavioural
 * half of RTL support that CSS logical properties cannot reach (arrow-key
 * semantics, drag deltas, popover placement). StylesProvider publishes explicit
 * `locale` / `dir` props here; `useLocale()` falls back to the document and the
 * browser when they are absent.
 *
 * Nothing here writes `dir` to the DOM — base direction is markup the consumer
 * owns (W3C: "Never use CSS to apply the base direction").
 *
 * Written with `createElement` rather than JSX, and free of relative imports,
 * so the Node test runner can load it directly.
 */

import { createContext, createElement, useContext, useMemo, useSyncExternalStore } from 'react'
import type { ReactNode } from 'react'

/**
 * LocaleDirectionType
 *
 * Base text direction.
 *
 * Values:
 * - "ltr": Left-to-right
 * - "rtl": Right-to-left
 */
export type LocaleDirectionType = 'ltr' | 'rtl'

/**
 * LocaleCodeType
 *
 * BCP 47 language tag, e.g. "en-US", "ar-EG", "he".
 */
export type LocaleCodeType = string

/**
 * LocaleValueType
 *
 * Shape returned by `useLocale()` — the resolved locale and its text direction.
 */
export interface LocaleValueType {
  /** Resolved BCP 47 language tag. */
  locale: LocaleCodeType
  /** Resolved base text direction. */
  direction: LocaleDirectionType
}

/**
 * Explicit values published by StylesProvider. Either may be absent.
 */
export interface LocaleExplicitValue {
  locale?: LocaleCodeType
  dir?: LocaleDirectionType
}

/**
 * Browser-provided locale signals. Every field is absent on the server.
 */
export interface LocaleEnvironment {
  /** `document.documentElement.lang` */
  documentLang?: string
  /** `document.documentElement.dir` */
  documentDir?: string
  /** `navigator.language` */
  navigatorLanguage?: string
}

/** Final locale fallback. */
const FALLBACK_LOCALE: LocaleCodeType = 'en'

/**
 * Language subtags written right-to-left. Used only when the engine lacks
 * `Intl.Locale.prototype.getTextInfo` / `textInfo`.
 */
const RTL_LANGUAGES: readonly string[] = ['ar', 'he', 'fa', 'ur', 'ps', 'dv', 'yi', 'ckb', 'sd', 'ug']

/** Empty environment — the server snapshot. Stable reference. */
const SERVER_ENVIRONMENT: LocaleEnvironment = {}

/** Empty explicit value — the context default. Stable reference. */
const EXPLICIT_DEFAULT: LocaleExplicitValue = {}

/**
 * Narrow a string to a `LocaleDirectionType`, rejecting `"auto"`, `""`, and
 * anything else.
 *
 * @param value - Candidate direction
 * @returns The direction, or undefined when it is not "ltr" / "rtl"
 */
function toDirection(value: string | undefined): LocaleDirectionType | undefined {
  return value === 'ltr' || value === 'rtl' ? value : undefined
}

/**
 * Derive the text direction of a locale. Uses `Intl.Locale` text info when the
 * engine provides it (method `getTextInfo()`, or the older `textInfo`
 * accessor); otherwise matches the language subtag against `RTL_LANGUAGES`.
 * Malformed tags fall through to the subtag match.
 *
 * @param locale - BCP 47 language tag
 * @returns "rtl" for right-to-left scripts, otherwise "ltr"
 */
export function getLocaleDirection(locale: LocaleCodeType): LocaleDirectionType {
  try {
    const intlLocale = new Intl.Locale(locale) as Intl.Locale & {
      getTextInfo?: () => { direction?: string }
      textInfo?: { direction?: string }
    }
    const info = typeof intlLocale.getTextInfo === 'function' ? intlLocale.getTextInfo() : intlLocale.textInfo
    const direction = toDirection(info?.direction)
    if (direction) return direction
  } catch {
    // Malformed tag — fall through to the subtag list
  }
  const language = locale.split(/[-_]/)[0].toLowerCase()
  return RTL_LANGUAGES.includes(language) ? 'rtl' : 'ltr'
}

/**
 * Resolve locale and direction from explicit values and the environment.
 *
 * Locale: explicit `locale` → `documentLang` → `navigatorLanguage` → "en".
 * Direction: explicit `dir` → (only when the locale did not come from explicit
 * props) `documentDir` when it is "ltr" / "rtl" → derived from the resolved
 * locale. An explicit locale therefore carries its own direction rather than
 * inheriting the document's.
 *
 * @param explicit - Values passed to StylesProvider
 * @param environment - Browser signals (empty on the server)
 * @returns The resolved locale and direction
 */
export function resolveLocale(
  explicit: LocaleExplicitValue,
  environment: LocaleEnvironment
): LocaleValueType {
  const locale = explicit.locale || environment.documentLang || environment.navigatorLanguage || FALLBACK_LOCALE
  const direction =
    explicit.dir ??
    (explicit.locale ? undefined : toDirection(environment.documentDir)) ??
    getLocaleDirection(locale)
  return { locale, direction }
}

/**
 * Read the browser locale signals. SSR-safe — returns an empty environment
 * when there is no document / navigator. Called only from `useLocale`
 * snapshots, never at module scope.
 *
 * @returns Current browser signals
 */
function readEnvironment(): LocaleEnvironment {
  const root = typeof document !== 'undefined' ? document.documentElement : undefined
  return {
    documentLang: root?.lang || undefined,
    documentDir: root?.dir || undefined,
    navigatorLanguage: typeof navigator !== 'undefined' ? navigator.language || undefined : undefined,
  }
}

// The document attributes and navigator.language fire no change event, so the
// snapshot is re-read on each render rather than pushed by a subscription.
const noopSubscribe = (): (() => void) => () => {}

const LocaleContext = createContext<LocaleExplicitValue>(EXPLICIT_DEFAULT)

/**
 * Read the resolved locale and text direction — `{ locale, direction }`.
 *
 * Source order: `locale` / `dir` props on the nearest StylesProvider, then
 * `document.documentElement.lang` / `.dir`, then `navigator.language`, then
 * "en". Direction not given explicitly is derived from the locale.
 *
 * SSR-safe: the server render (and hydration) uses only the explicit props
 * plus the "en" fallback; the client re-renders with document / navigator
 * values after hydration.
 *
 * @returns The resolved locale and direction
 *
 * @example
 * const { direction } = useLocale()
 * const nextKey = direction === "rtl" ? "ArrowLeft" : "ArrowRight"
 */
export function useLocale(): LocaleValueType {
  const explicit = useContext(LocaleContext)
  const locale = useSyncExternalStore(
    noopSubscribe,
    () => resolveLocale(explicit, readEnvironment()).locale,
    () => resolveLocale(explicit, SERVER_ENVIRONMENT).locale
  )
  const direction = useSyncExternalStore(
    noopSubscribe,
    () => resolveLocale(explicit, readEnvironment()).direction,
    () => resolveLocale(explicit, SERVER_ENVIRONMENT).direction
  )
  // Stable reference until either value changes
  return useMemo<LocaleValueType>(() => ({ locale, direction }), [locale, direction])
}

/**
 * Inner provider that publishes explicit `locale` / `dir`. StylesProvider
 * mounts it only when either prop is set, so a nested StylesProvider without
 * them does not shadow an ancestor's values.
 */
export function LocaleContextProvider({
  locale,
  dir,
  children,
}: LocaleExplicitValue & { children: ReactNode }) {
  const value = useMemo<LocaleExplicitValue>(() => ({ locale, dir }), [locale, dir])
  return createElement(LocaleContext.Provider, { value }, children)
}
