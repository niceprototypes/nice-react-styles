/**
 * StylesProvider module exports
 */

// Provider component
export { StylesProvider } from './StylesProvider'
export type { StylesProviderProps } from './StylesProvider.types'

// Device detection — read with useDevice when `detectDevice` is set
export { useDevice } from './DeviceContext'
export type { DeviceState } from './DeviceContext'
export { MOBILE_USER_AGENTS } from './useDeviceDetection'

// OS color-scheme detection — read with useTheme when `detectTheme` is set
export { useTheme } from './ThemeContext'
export type { ThemeContextValue } from './ThemeContext'