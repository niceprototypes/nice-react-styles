import * as React from "react"
import type { ModeType } from "nice-styles"

export interface ModeProps {
  /**
   * Mode to pin descendants to. The element is rendered with
   * `data-theme={name}`, and `tokens.css` reassigns every semantic mode var
   * to its day/night primitive on the matched element — cascading through
   * descendants regardless of whether they are nice components, raw markup,
   * or third-party widgets that consume `var(--np--…)`.
   */
  name: ModeType
  /**
   * Optional class to add to the wrapper element. Useful for scoping
   * consumer-side CSS overrides to a specific Mode instance (e.g.
   * `className="nice-storybook"` and target `.nice-storybook .sbdocs …`).
   */
  className?: string
  /** Content to pin. */
  children: React.ReactNode
}

/**
 * Mode
 *
 * Pins a subtree to a specific design-system mode (`day` / `night` / …) by
 * setting `data-theme` on a layout-invisible wrapper element. The CSS rules
 * emitted by nice-styles' `tokens.css` reassign semantic mode vars at every
 * `[data-theme]` selector, so the pin propagates through the cascade.
 *
 * Children with their own explicit `mode` prop nest cleanly — each one sets
 * its own `data-theme` further down and overrides the ancestor's pin.
 *
 * @example
 * <Mode name="day">
 *   <App />
 * </Mode>
 *
 * @example
 * <Mode name="day">
 *   <Typography>day text</Typography>
 *   <Mode name="night">
 *     <Typography>night text inside day region</Typography>
 *   </Mode>
 * </Mode>
 */
export const Mode: React.FC<ModeProps> = ({ name, className, children }) => (
  <div data-theme={name} className={className} style={{ display: "contents" }}>
    {children}
  </div>
)

export default Mode
