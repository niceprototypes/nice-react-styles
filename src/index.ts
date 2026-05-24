/**
 * nice-react-styles
 * React provider component for nice-styles CSS variables with styled-components theme support
 */

export { StylesProvider } from './components/StylesProvider'
export { Mode } from './components/Mode'
export type { ModeProps } from './components/Mode'

// Service exports
export { createTokens } from './services/createTokens'
export { withBreakpoints } from './services/withBreakpoints'
export type { BreakpointOverride, WithBreakpointsProps } from './services/withBreakpoints'

// Re-export the nice-styles public API. nice-react-styles consumers don't
// need to import from two packages.
export {
  getToken,
  getTokenKey,
  getTokenValue,
  getBreakpoint,
  getBreakpointValue,
  getModeToken,
  getModeTokenKey,
  getModeTokenValue,
  getBreakpointToken,
  getBreakpointTokenKey,
  getBreakpointTokenValue,
  setCoreTokens,
  setModeTokens,
  setBreakpointTokens,
  setBreakpoints,
  getConstant,
  NAMESPACE,
  getComponentToken,
  getComponentTokenKey,
  getComponentTokenValue,
  getInvertedMode,
  getTextHeight,
  getTokenFromMap,
  getTokenByPath,
  camelToKebab,
  Theme,
  componentTokensData,
  parseGoogleFontsUrl,
  isStyleValue,
  DEFAULT_MODE,
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
  ModeValue,
  BreakpointValue,
  StyleValueKind,
  // Token result types
  TokenResult,
  ComponentPrefix,
  BreakpointName,
  BreakpointValues,
  CssConstantOptions,
  TokenDefinition,
  TokenMap,
  ComponentTokenNode,
  TokenFromMapOptions,
  // Google fonts
  FontAxis,
  GoogleFontMetadata,
  LinkAttributes,
  GoogleFontsConfig,
  // Token union types
  AnimationDurationType,
  AnimationEasingType,
  BackgroundColorType,
  BackgroundSizeType,
  BorderColorType,
  BorderRadiusType,
  BorderWidthType,
  BoxShadowType,
  CellHeightType,
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
  // Mode types
  ModeType,
} from 'nice-styles'

// Type exports
export type { StylesProviderProps } from './components/StylesProvider/StylesProvider.types'
export type { Breakpoints } from './types'