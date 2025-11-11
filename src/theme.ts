import {
  animationDuration,
  animationEasing,
  backgroundColor,
  borderColor,
  borderRadius,
  borderWidth,
  boxShadow,
  cellHeight,
  contentColor,
  fontFamily,
  fontSize,
  gapSize,
  iconStrokeWidth,
  lineHeight,
  backgroundColorReverse,
  contentColorReverse,
  borderColorReverse,
  contentColorStatus,
  iconStrokeColor,
  iconStrokeColorReverse,
} from 'nice-styles'

/**
 * Theme object that maps nice-styles variables to a structured theme.
 * Can be accessed in styled-components via props.theme
 */
export const niceStylesTheme = {
  animation: {
    duration: animationDuration,
    easing: animationEasing,
  },
  background: {
    color: backgroundColor,
    colorReverse: backgroundColorReverse,
  },
  border: {
    color: borderColor,
    colorReverse: borderColorReverse,
    radius: borderRadius,
    width: borderWidth,
  },
  boxShadow,
  cell: {
    height: cellHeight,
  },
  content: {
    color: contentColor,
    colorReverse: contentColorReverse,
    colorStatus: contentColorStatus,
  },
  font: {
    family: fontFamily,
    size: fontSize,
  },
  gap: {
    size: gapSize,
  },
  icon: {
    strokeColor: iconStrokeColor,
    strokeColorReverse: iconStrokeColorReverse,
    strokeWidth: iconStrokeWidth,
  },
  lineHeight,
}

export type NiceStylesTheme = typeof niceStylesTheme