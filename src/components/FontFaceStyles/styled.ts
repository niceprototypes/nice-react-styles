/**
 * Styled-components for FontFaceStyles
 */

import { createGlobalStyle } from 'styled-components'
import { getToken } from 'nice-styles'
import type { GoogleFontMetadata } from './types'
import {
  getWeightAxis,
  getVariationSettings,
  isWeightSupported,
} from '../../services/parseFontUrl'

export interface GlobalFontFaceStylesProps {
  metadata: GoogleFontMetadata
}

/**
 * Generates @font-face CSS for each nice-styles font weight
 * Uses the full variable font axis functionality
 *
 * For variable fonts with a wght axis, creates specific @font-face rules for:
 * - light (300)
 * - base (400)
 * - medium (500)
 * - semibold (600)
 * - bold (700)
 * - extrabold (800)
 * - black (900)
 *
 * Each @font-face rule sets:
 * - font-family to the font name
 * - font-weight to the specific weight value
 * - font-variation-settings for other axes (opsz, ROND, etc.)
 * - font-display based on the metadata
 */
function generateFontFaceCSS(metadata: GoogleFontMetadata): string {
  const weightAxis = getWeightAxis(metadata)

  // If no weight axis, return empty (let Google Fonts CSS handle it)
  if (!weightAxis) {
    return ''
  }

  // Get variation settings for non-weight axes
  const variationSettings = getVariationSettings(metadata, ['wght'])

  // Font weights from nice-styles
  const weights = {
    light: parseInt(getToken('fontWeight', 'light').value, 10),
    base: parseInt(getToken('fontWeight', 'base').value, 10),
    medium: parseInt(getToken('fontWeight', 'medium').value, 10),
    semibold: parseInt(getToken('fontWeight', 'semibold').value, 10),
    bold: parseInt(getToken('fontWeight', 'bold').value, 10),
    extrabold: parseInt(getToken('fontWeight', 'extrabold').value, 10),
    black: parseInt(getToken('fontWeight', 'black').value, 10),
  }

  // Generate @font-face for each supported weight
  const fontFaces = Object.entries(weights)
    .filter(([, weight]) => isWeightSupported(metadata, weight))
    .map(([name, weight]) => {
      const fontFace = `
  @font-face {
    font-family: '${metadata.family}';
    font-style: normal;
    font-weight: ${weight};
    font-display: ${metadata.display || 'swap'};
    src: url('${metadata.cssUrl}') format('woff2');
    ${variationSettings ? `font-variation-settings: ${variationSettings};` : ''}
  }`
      return fontFace
    })
    .join('\n')

  return fontFaces
}

/**
 * Global styles component that injects @font-face declarations
 * This ensures the font is properly loaded with all weight variants
 */
export const GlobalFontFaceStyles = createGlobalStyle<GlobalFontFaceStylesProps>`
  ${(props) => generateFontFaceCSS(props.metadata)}
`