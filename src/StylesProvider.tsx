import { ReactNode } from 'react'
import { ThemeProvider } from 'styled-components'
import { niceStylesTheme } from './theme'

/**
 * Available CSS token categories that can be selectively imported
 */
export type TokenCategory =
  | 'animation'
  | 'background-color'
  | 'border-color'
  | 'border-radius'
  | 'border-width'
  | 'box-shadow'
  | 'cell-height'
  | 'content-color'
  | 'font-family'
  | 'font-size'
  | 'gap-size'
  | 'icon-stroke-color'
  | 'icon-stroke-width'
  | 'inverse'
  | 'line-height'

/**
 * Props for the StylesProvider component
 */
export interface StylesProviderProps {
  /**
   * Child components that will have access to nice-styles theme and CSS variables
   */
  children: ReactNode
  /**
   * Optional array of token categories to selectively import CSS variables for.
   * If not specified, all CSS variables are imported.
   *
   * @example
   * ```tsx
   * <StylesProvider tokens={['font-family', 'font-size', 'content-color']}>
   *   <App />
   * </StylesProvider>
   * ```
   */
  tokens?: TokenCategory[]
}

/**
 * A wrapper component that provides nice-styles CSS variables and theme to the component tree.
 * Uses styled-components ThemeProvider to make design tokens available via props.theme.
 *
 * @example
 * ```tsx
 * import { StylesProvider } from 'nice-react-styles'
 *
 * function App() {
 *   return (
 *     <StylesProvider>
 *       <YourComponent />
 *     </StylesProvider>
 *   )
 * }
 *
 * // With selective token imports
 * function App() {
 *   return (
 *     <StylesProvider tokens={['font-family', 'content-color']}>
 *       <YourComponent />
 *     </StylesProvider>
 *   )
 * }
 * ```
 */
export function StylesProvider({ children, tokens }: StylesProviderProps) {
  // Dynamically import CSS files based on tokens prop
  if (tokens) {
    tokens.forEach((token) => {
      import(`nice-styles/static/css/${token}.css`)
    })
  } else {
    // Import all CSS variables
    import('nice-styles')
  }

  return <ThemeProvider theme={niceStylesTheme}>{children}</ThemeProvider>
}