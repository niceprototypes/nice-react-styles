/**
 * nice-react-styles
 * React provider component for nice-styles CSS variables with styled-components theme support
 */

export { StylesProvider } from './components/StylesProvider'

// Service exports
export { createTokens } from './services/createTokens'
export type { ComponentTokens } from './services/createTokens'
export { withBreakpoints } from './services/withBreakpoints'
export type { BreakpointOverride, WithBreakpointsProps } from './services/withBreakpoints'

// Token registry - unified token access
export { getReactToken, getReactTokenKey, getReactTokenValue } from './services/getReactToken'
export { DEFAULT_MODE, DEFAULT_BREAKPOINT } from './services/styleValues'
export type { StyleValueKind } from './services/styleValues'
export type { ModeValue } from './services/ModeValue'
export type { BreakpointValue } from './services/BreakpointValue'

// Re-export all nice-styles public API
export {
  getBreakpoint,
  getBreakpointValue,
  getColorToken,
  getColorTokenKey,
  getColorTokenValue,
  getSizeToken,
  getSizeTokenKey,
  getSizeTokenValue,
  setCoreTokens,
  setColorTokens,
  setSizeTokens,
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
  BREAKPOINT_PHONE,
  BREAKPOINT_TABLET,
  BREAKPOINT_LAPTOP,
  BREAKPOINT_DESKTOP,
  BREAKPOINTS,
} from 'nice-styles'

export type {
  // Token result types
  TokenResult,
  ComponentPrefix,
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
export type { StylesProviderProps } from './components/StylesProvider/StylesProvider.types'
export type { Breakpoints, GoogleFontsConfig, LinkAttributes, GoogleFontMetadata, FontAxis } from './types'