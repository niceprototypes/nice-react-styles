/**
 * Utility functions for parsing Google Fonts URLs and extracting metadata
 */

import type { GoogleFontMetadata, FontAxis } from '../types'

/**
 * Parses a Google Fonts URL to extract font family and axis information
 *
 * @example
 * ```ts
 * const url = 'https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght,ROND@6..144,1..1000,37&display=swap'
 * const metadata = parseGoogleFontsUrl(url)
 * // Returns: {
 * //   family: 'Google Sans Flex',
 * //   axes: [
 * //     { tag: 'opsz', min: 6, max: 144 },
 * //     { tag: 'wght', min: 1, max: 1000 },
 * //     { tag: 'ROND', min: 37, max: 37 }
 * //   ],
 * //   display: 'swap',
 * //   cssUrl: '...'
 * // }
 * ```
 */
export function parseGoogleFontsUrl(url: string): GoogleFontMetadata | null {
  try {
    const urlObj = new URL(url)

    // Extract family parameter
    const familyParam = urlObj.searchParams.get('family')
    if (!familyParam) {
      return null
    }

    // Parse family name and axes
    // Format: "Font+Name:axis1,axis2,axis3@min1..max1,min2..max2,value3"
    const [familyPart, axesPart] = familyParam.split(':')
    const family = familyPart.replace(/\+/g, ' ')

    // Extract display parameter
    const display = urlObj.searchParams.get('display') as
      | 'swap'
      | 'block'
      | 'fallback'
      | 'optional'
      | null

    // If no axes specified, return basic metadata
    if (!axesPart) {
      return {
        family,
        axes: [],
        display: display || undefined,
        cssUrl: url,
      }
    }

    // Parse axes (e.g., "opsz,wght,ROND@6..144,1..1000,37")
    const [axisNames, axisValues] = axesPart.split('@')
    const axisTags = axisNames.split(',')
    const axisRanges = axisValues.split(',')

    const axes: FontAxis[] = axisTags.map((tag, index) => {
      const range = axisRanges[index]

      // Check if it's a range (e.g., "1..1000") or a single value (e.g., "37")
      if (range.includes('..')) {
        const [min, max] = range.split('..').map(Number)
        return { tag, min, max }
      } else {
        // Single value means fixed axis
        const value = Number(range)
        return { tag, min: value, max: value, default: value }
      }
    })

    return {
      family,
      axes,
      display: display || undefined,
      cssUrl: url,
    }
  } catch (error) {
    console.error('Failed to parse Google Fonts URL:', error)
    return null
  }
}

/**
 * Extracts the weight axis from font metadata
 * Returns the wght axis if it exists, or null
 */
export function getWeightAxis(metadata: GoogleFontMetadata): FontAxis | null {
  return metadata.axes.find((axis) => axis.tag === 'wght') || null
}

/**
 * Checks if a font supports variable weights
 * A font supports variable weights if it has a wght axis with a range
 */
export function supportsVariableWeight(metadata: GoogleFontMetadata): boolean {
  const weightAxis = getWeightAxis(metadata)
  return weightAxis ? weightAxis.min !== weightAxis.max : false
}

/**
 * Gets the font-variation-settings string for non-weight axes
 * This is used in @font-face rules to set fixed values for other axes
 *
 * @example
 * ```ts
 * getVariationSettings(metadata, ['wght']) // Exclude weight
 * // Returns: '"opsz" 144, "ROND" 37'
 * ```
 */
export function getVariationSettings(
  metadata: GoogleFontMetadata,
  excludeAxes: string[] = []
): string {
  const nonWeightAxes = metadata.axes.filter(
    (axis) => !excludeAxes.includes(axis.tag)
  )

  if (nonWeightAxes.length === 0) {
    return ''
  }

  return nonWeightAxes
    .map((axis) => {
      // Use default if specified, otherwise use max value for aesthetics
      const value = axis.default ?? axis.max
      return `"${axis.tag}" ${value}`
    })
    .join(', ')
}

/**
 * Validates that a weight value is within the font's supported range
 */
export function isWeightSupported(
  metadata: GoogleFontMetadata,
  weight: number
): boolean {
  const weightAxis = getWeightAxis(metadata)
  if (!weightAxis) {
    return false
  }
  return weight >= weightAxis.min && weight <= weightAxis.max
}