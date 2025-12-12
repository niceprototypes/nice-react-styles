/**
 * FontFaceStyles Component
 *
 * Renders global @font-face styles for a Google Font
 */

import { GlobalFontFaceStyles } from './styled'
import type { FontFaceStylesProps } from './types'

/**
 * Component that renders global @font-face styles for a Google Font
 * Maps nice-styles fontWeight tokens to specific weight values
 *
 * @example
 * ```tsx
 * const metadata = {
 *   family: 'Google Sans Flex',
 *   axes: [
 *     { tag: 'opsz', min: 6, max: 144 },
 *     { tag: 'wght', min: 1, max: 1000 },
 *     { tag: 'ROND', min: 37, max: 37 }
 *   ],
 *   display: 'swap',
 *   cssUrl: 'https://fonts.googleapis.com/css2?family=...'
 * }
 *
 * <FontFaceStyles metadata={metadata} />
 * ```
 */
export function FontFaceStyles({ metadata }: FontFaceStylesProps) {
  return <GlobalFontFaceStyles metadata={metadata} />
}