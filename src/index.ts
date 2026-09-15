/**
 * nice-react-styles
 * React provider component for nice-styles CSS variables with styled-components theme support
 */

export { StylesProvider, useDevice, useTheme, MOBILE_USER_AGENTS } from './components/StylesProvider'
export type { DeviceState, ThemeContextValue } from './components/StylesProvider'
export { Theme } from './components/Theme'
export type { ThemeProps } from './components/Theme'

// Service exports
export { setTokens } from './services/setTokens'
export { withBreakpoints, useBreakpoint } from './services/withBreakpoints'
export type { BreakpointKey, BreakpointOverride, WithBreakpointsProps } from './services/withBreakpoints'

// Re-export the nice-styles public API. nice-react-styles consumers don't
// need to import from two packages.
export {
  getToken,
  getBreakpoint,
  getBreakpointValue,
  getConstant,
  getConstantKey,
  applyTheme,
  NAMESPACE,
  transformColor,
  getTextHeight,
  camelToKebab,
  Colors,
  componentTokensData,
  parseGoogleFontsUrl,
  parseAdobeFontsUrl,
  isStyleValue,
  DEFAULT_THEME,
  DEFAULT_BREAKPOINT,
  STYLE_VALUE_KEYS,
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  BREAKPOINTS,
} from 'nice-styles'

export type {
  // Style-value shapes
  ThemeValue,
  BreakpointValue,
  StyleValueKind,
  // Token getter
  TokenOptions,
  TokenAccessor,
  ThemeName,
  ComponentPrefix,
  BreakpointName,
  BreakpointValues,
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

// Type exports
export type { StylesProviderProps } from './components/StylesProvider/StylesProvider.types'
export type { Breakpoints } from './types'
