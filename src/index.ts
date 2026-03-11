/**
 * nice-react-styles
 * React provider component for nice-styles CSS variables with styled-components theme support
 */

export { StylesProvider } from './components/StylesProvider'

// Service exports
export { createTokens } from './services/createTokens'
export type { ComponentTokens } from './services/createTokens'

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
  DEFAULT_MODE,
} from './services/tokenRegistry'
export type { ModeValue } from './services/tokenRegistry'

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
} from 'nice-styles'

export type {
  // Token result types
  TokenResult,
  ComponentPrefix,
  BreakpointResult,
  BreakpointName,
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
export type { GoogleFontsConfig, LinkAttributes, GoogleFontMetadata, FontAxis } from './types'