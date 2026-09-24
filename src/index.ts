/**
 * nice-react-styles — package entry.
 *
 * React bindings for nice-styles: `StylesProvider` (fonts, device and theme
 * detection), `Theme` (subtree theme pin), `setTokens` (register + inject
 * token CSS), and breakpoint helpers. Also re-exports the nice-styles public
 * API so React apps import tokens from this one package.
 */

// Components and their context hooks
export { StylesProvider, useDevice, useTheme, useLocale, MOBILE_USER_AGENTS } from './components/StylesProvider'
export type {
  DeviceState,
  ThemeContextValue,
  LocaleCodeType,
  LocaleDirectionType,
  LocaleValueType,
} from './components/StylesProvider'
export { Theme } from './components/Theme'
export type { ThemeProps } from './components/Theme'

// Service exports
export { setTokens, setBreakpoints } from './services/setTokens'
export { withBreakpoints, useBreakpoint } from './services/withBreakpoints'
export type { BreakpointKey, BreakpointOverride, WithBreakpointsProps } from './services/withBreakpoints'

// Re-export the nice-styles public API. nice-react-styles consumers don't
// need to import from two packages.
export {
  // Token getter, enumeration, and store
  getToken,
  listTokens,
  resolveColorProp,
  registry,
  registerTokens,
  // Breakpoint queries
  getBreakpoint,
  getBreakpointValue,
  // Variable names without a registry lookup
  getConstant,
  getConstantKey,
  // Theme, color, and text utilities
  applyTheme,
  NAMESPACE,
  transformColor,
  getTextHeight,
  camelToKebab,
  // Raw generated data
  Colors,
  componentTokensData,
  // Font URL parsing
  parseGoogleFontsUrl,
  parseAdobeFontsUrl,
  // Style-value classification and defaults
  isStyleValue,
  DEFAULT_THEME,
  DEFAULT_BREAKPOINT,
  STYLE_VALUE_KEYS,
  // Breakpoint names, order, and current thresholds
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  BREAKPOINT_ORDER,
  SETTABLE_BREAKPOINTS,
  BREAKPOINTS,
} from 'nice-styles'

export type {
  // Style-value shapes
  ThemeValue,
  BreakpointValue,
  StyleValueKind,
  // Token getter and registry
  TokenOptions,
  TokenAccessor,
  ColorTokenProp,
  ColorPropObject,
  ChannelValue,
  TokenListing,
  ListTokensFilter,
  TokenSource,
  TokenEntry,
  TokenValue,
  ThemeName,
  ComponentPrefix,
  BreakpointName,
  BreakpointValues,
  SettableBreakpoint,
  CssConstantOptions,
  TokenDefinition,
  TokenMap,
  ComponentTokenNode,
  TransformColorOptions,
  // Google fonts
  FontAxis,
  GoogleFontMetadata,
  LinkAttributes,
  GoogleFontsConfig,
  // Adobe fonts
  AdobeFontMetadata,
  AdobeFontsConfig,
  // Token union types
  AnimationDurationType,
  AnimationEasingType,
  BackgroundColorType,
  BackgroundSizeType,
  BorderColorType,
  BorderRadiusType,
  BorderWidthType,
  BoxShadowType,
  SizeType,
  ColorType,
  FontFamilyType,
  FontSizeType,
  FontWeightType,
  GapType,
  LetterSpacingType,
  LineHeightType,
  // Layout types
  SpacingShorthandType,
  SpacingDefinitionType,
  SpacingResponsiveType,
  SpacingType,
  // Theme types
  ThemeType,
} from 'nice-styles'

// Package-local types
export type { StylesProviderProps } from './components/StylesProvider/StylesProvider.types'
export type { Breakpoints } from './types'
