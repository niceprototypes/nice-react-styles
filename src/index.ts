/**
 * nice-react-styles
 * React provider component for nice-styles CSS variables with styled-components theme support
 */

export { StylesProvider } from './components/StylesProvider'

// Service exports
export { createTokens } from './services/createTokens'
export type { ComponentTokens } from './services/createTokens'
export { useBreakpoint } from './services/useBreakpoint'
export { withBreakpoints } from './services/withBreakpoints'
export type { BreakpointOverride, WithBreakpointsProps } from './services/withBreakpoints'

// Token registry - unified token access
export {
  getToken,
  registerTokens,
  hasToken,
  getTokenNames,
  getTokenVariants,
  getTokenModes,
  getTokenModeValue,
  isModeValue,
  isBreakpointValue,
  DEFAULT_MODE,
  DEFAULT_BREAKPOINT,
} from './services/tokenRegistry'
export type { ModeValue, BreakpointValue } from './services/tokenRegistry'

// Re-export all nice-styles public API
export {
  getBreakpoint,
  getColorToken,
  getSizeToken,
  setCoreTokens,
  setColorTokens,
  setSizeTokens,
  getConstant,
  NAMESPACE,
  getComponentToken,
  getInvertedMode,
  getTextHeight,
  getTokenFromMap,
  getTokenByPath,
  camelToKebab,
  Theme,
  componentTokensData,
  BREAKPOINT_SMALL,
  BREAKPOINT_MEDIUM,
  BREAKPOINT_LARGE,
  BREAKPOINTS,
} from 'nice-styles'

export type {
  // Token result types
  TokenResult,
  ComponentPrefix,
  BreakpointResult,
  BreakpointName,
  BreakpointValues,
  CoreTokenConfig,
  CssConstantResult,
  CssConstantOptions,
  TokenDefinition,
  TokenMap,
  ComponentTokenNode,
  TokenFromMapOptions,
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
  ForegroundColorType,
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
export type { StylesProviderProps } from './components/StylesProvider/types'
export type { Breakpoints, GoogleFontsConfig, LinkAttributes, GoogleFontMetadata, FontAxis } from './types'