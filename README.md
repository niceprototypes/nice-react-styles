# nice-react-styles

React bindings for [nice-styles](https://github.com/niceprototypes/nice-styles): the `StylesProvider` and `Theme` components, `setTokens`, breakpoint hooks, and a re-export of the nice-styles token API — so a React app imports from one package.

## Installation

```bash
npm install nice-styles nice-react-styles
```

Peer dependencies: `react` and `react-dom` 19.2+, `styled-components` 6.1.18+.

## Setup

Import the generated CSS once, set your tokens at module load, and wrap the app:

```ts
// src/nice/tokens.ts
import { setTokens } from "nice-react-styles"

setTokens({
  breakpoints: { laptop: 1100 },                                // thresholds (optional)
  fontSize: { base: "18px", jumbo: "96px" },                    // override + custom variant
  brandColor: { primary: { day: "#dc0000", night: "#ff6666" } }, // themed custom token
  gap: { base: { phone: "12px", "laptop+": "20px" } },          // responsive value
})
```

```tsx
// src/index.tsx
import "nice-styles/tokens.css"
import "./nice/tokens"
import { StylesProvider } from "nice-react-styles"

root.render(
  <StylesProvider>
    <App />
  </StylesProvider>
)
```

`setTokens` registers every token in the shared registry (so `getToken` sees it) and injects CSS with the same shape as `tokens.css`: semantic variables, `@media` breakpoint blocks, and theme switching through `prefers-color-scheme` and `[data-theme]`.

## Reading tokens

```tsx
import styled from "styled-components"
import { getToken, getBreakpoint } from "nice-react-styles"

const Card = styled.div`
  padding: ${getToken("gap")};                               /* var(--np--gap) */
  color: ${getToken("brandColor", "primary")};               /* var(--np--brand-color--primary) */

  ${getBreakpoint("laptop+")} {
    padding: ${getToken("gap", "large")};
  }
`

getToken("gap", "base", { as: "value" })                     // "16px"
getToken("color", "base", { theme: "night" })                // "var(--np--color--night)"
getToken("button.icon.size:small")                           // component token
```

`getToken` is the single getter for every token kind; `listTokens` enumerates them (`listTokens({ prefix: "button" })`). See the nice-styles README for options.

## API

### Components

| Export | Purpose |
|---|---|
| `StylesProvider` | Root provider. Props: `googleFonts`, `adobeFonts`, `links` (font loading), `detectDevice` (enables `useDevice`), `detectTheme` (enables `useTheme`). |
| `Theme` | Pins a subtree to a theme: `<Theme name="night">…</Theme>` renders `data-theme="night"`, and every token below follows it. |

### Services and hooks

| Export | Purpose |
|---|---|
| `setTokens(tokenMap, prefix?)` | Register tokens and inject their CSS. Reserved `breakpoints` key sets `tablet` / `laptop` / `desktop` floors in pixels. |
| `withBreakpoints(Component, defaults?)` | Adds a `breakpoints` prop of per-breakpoint prop overrides: `breakpoints={{ "laptop+": { spacing: "large" } }}`. Most specific matching key wins. |
| `useBreakpoint()` | Current breakpoint name (`phone` / `tablet` / `laptop` / `desktop`), updated on resize. |
| `useDevice()` | `{ isMobile, userAgent, mobileUserAgents }` when `StylesProvider detectDevice` is set. |
| `useTheme()` | `{ theme }` from the OS color-scheme preference when `StylesProvider detectTheme` is set. |

### Re-exported from nice-styles

`getToken`, `listTokens`, `registry`, `registerTokens`, `getConstant`, `getConstantKey`, `getBreakpoint`, `getBreakpointValue`, `applyTheme`, `transformColor`, `getTextHeight`, `isStyleValue`, `parseGoogleFontsUrl`, `parseAdobeFontsUrl`, the breakpoint constants (`BREAKPOINTS`, `BREAKPOINT_ORDER`, `SETTABLE_BREAKPOINTS`, …), and the token and style-value types.

## Breakpoint keys

A bare name is one band (`tablet`); `+` covers that breakpoint and wider (`tablet+`); `-` covers it and narrower (`tablet-`). The same keys work in `setTokens` values, `withBreakpoints` overrides, and `getBreakpoint`.

## License

MIT
