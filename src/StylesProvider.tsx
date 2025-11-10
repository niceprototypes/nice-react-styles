import { ReactNode } from 'react'
import 'nice-styles'

/**
 * Props for the StylesProvider component
 */
export interface StylesProviderProps {
  /**
   * Child components that will have access to nice-styles CSS variables
   */
  children: ReactNode
  /**
   * Optional className to apply to the wrapper div
   */
  className?: string
  /**
   * Optional style object to apply custom CSS variable overrides
   */
  style?: React.CSSProperties
}

/**
 * A wrapper component that ensures nice-styles CSS variables are available
 * in the component tree. This creates a scoped area where CSS variables
 * can be referenced.
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
 * ```
 */
export function StylesProvider({
  children,
  className = '',
  style
}: StylesProviderProps) {
  return (
    <div
      className={`nice-styles-provider ${className}`.trim()}
      style={{
        fontFamily: 'var(--font-family-body)',
        color: 'var(--content-color-1)',
        minHeight: '100vh',
        width: '100%',
        ...style
      }}
    >
      {children}
    </div>
  )
}