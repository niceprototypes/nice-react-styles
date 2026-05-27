import * as React from "react"
import type { ThemeType } from "nice-styles"

export interface ThemeProps {
  /**
   * Theme to pin descendants to. The element is rendered with
   * `data-theme={name}`, and `tokens.css` reassigns every semantic theme var
   * to its day/night primitive on the matched element — cascading through
   * descendants regardless of whether they are nice components, raw markup,
   * or third-party widgets that consume `var(--np--…)`.
   */
  name: ThemeType
  /**
   * Optional class to add to the wrapper element. Useful for scoping
   * consumer-side CSS overrides to a specific Theme instance (e.g.
   * `className="nice-storybook"` and target `.nice-storybook .sbdocs …`).
   */
  className?: string
  /** Content to pin. */
  children: React.ReactNode
}

/**
 * Theme
 *
 * Pins a subtree to a specific design-system theme (`day` / `night` / …) by
 * setting `data-theme` on a layout-invisible wrapper element. The CSS rules
 * emitted by nice-styles' `tokens.css` reassign semantic theme vars at every
 * `[data-theme]` selector, so the pin propagates through the cascade.
 *
 * Children with their own explicit `theme` prop nest cleanly — each one sets
 * its own `data-theme` further down and overrides the ancestor's pin.
 *
 * @example
 * <Theme name="day">
 *   <App />
 * </Theme>
 *
 * @example
 * <Theme name="day">
 *   <Typography>day text</Typography>
 *   <Theme name="night">
 *     <Typography>night text inside day region</Typography>
 *   </Theme>
 * </Theme>
 */
export const Theme: React.FC<ThemeProps> = ({ name, className, children }) => (
  <div data-theme={name} className={className} style={{ display: "contents" }}>
    {children}
  </div>
)

export default Theme