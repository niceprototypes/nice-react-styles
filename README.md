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

export const getToken = setTokens({
  breakpoints: { laptop: 1100 },                                // thresholds (optional)
  fontSize: { base: "18px", jumbo: "96px" },                    // override + custom variant
  brandColor: { primary: { day: "#dc0000", night: "#ff6666" } }, // themed custom token
  gap: { base: { "phone+": "12px", "laptop+": "20px" } },        // responsive value
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

`setTokens` registers every token in the shared registry (so `getToken` sees it), returns `getToken` typed for the core tokens plus this map's groups and variants, and injects CSS with the same shape as `tokens.css`: semantic variables, `@media` breakpoint blocks, and theme switching through `prefers-color-scheme` and `[data-theme]`.

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

### Typing custom tokens

The `getToken` that `setTokens` returns (Setup above) already accepts the map's groups and variants; import it from `src/nice/tokens.ts` and no declaration is needed. The plain `getToken` re-export accepts only declared groups and variants (`TokenAddress`, `TokenVariants`); to type it for a group added with `setTokens` (`brandColor` above), declare the group on the `CustomTokenVariants` interface. Augment it on `"nice-styles"`, where the interface is declared:

```ts
import { setTokens } from "nice-react-styles"

declare module "nice-styles" {
  interface CustomTokenVariants {
    brandColor: "primary"
  }
}

setTokens({ brandColor: { primary: "#dc0000" } })
```

`declare module "nice-react-styles"` also merges, because nice-react-styles re-exports `CustomTokenVariants` from nice-styles; before that re-export (nice-react-styles 15.0.1 and earlier) it declared an unrelated interface and `getToken` still rejected the group, with no error on the declaration. `"nice-styles"` works with every version.

## API

### Components

| Export | Purpose |
|---|---|
| `StylesProvider` | Root provider. Props: `googleFonts`, `adobeFonts`, `links` (font loading), `detectDevice` (enables `useDevice`), `detectTheme` (enables `useTheme`). |
| `Theme` | Pins a subtree to a theme: `<Theme name="night">…</Theme>` renders `data-theme="night"`, and every token below follows it. |

### Services and hooks

| Export | Purpose |
|---|---|
| `setTokens(tokenMap, prefix?)` | Register tokens and inject their CSS; returns `getToken` typed for the core tokens plus the map. Reserved `breakpoints` key sets `tablet` / `laptop` / `desktop` floors in pixels. |
| `withBreakpoints(Component, defaults?)` | Adds a `breakpoints` prop of per-breakpoint prop overrides: `breakpoints={{ "laptop+": { spacing: "large" } }}`. Most specific matching key wins. |
| `useBreakpoint()` | Current breakpoint name (`phone` / `tablet` / `laptop` / `desktop`), updated on resize. |
| `useDevice()` | `{ isMobile, userAgent, mobileUserAgents }` when `StylesProvider detectDevice` is set. |
| `useTheme()` | `{ theme }` from the OS color-scheme preference when `StylesProvider detectTheme` is set. |

### Re-exported from nice-styles

`getToken`, `listTokens`, `registry`, `registerTokens`, `getConstant`, `getConstantKey`, `getBreakpoint`, `getBreakpointValue`, `applyTheme`, `transformColor`, `getTextHeight`, `isStyleValue`, `parseGoogleFontsUrl`, `parseAdobeFontsUrl`, the breakpoint constants (`BREAKPOINTS`, `BREAKPOINT_ORDER`, `SETTABLE_BREAKPOINTS`, …), and the token and style-value types, including `TokenAddress`, `TokenGroup`, `TokenVariants`, `TokenInverseVariants`, and `CustomTokenVariants`.

## Fonts

`StylesProvider` loads fonts through `googleFonts` (URL or config), `adobeFonts` (kit id, kit URL, or config), and `links` (raw `<link>` descriptors). It loads none by default. The Nice default fonts (Google Sans Flex + Roboto Mono):

```tsx
<StylesProvider googleFonts="https://fonts.googleapis.com/css2?family=Google+Sans+Flex:opsz,wght,ROND@6..144,1..1000,37&family=Roboto+Mono:wght@100..700&display=swap">
  <App />
</StylesProvider>
```

Self-hosted fonts: pass a stylesheet of `@font-face` rules through `links`:

```tsx
<StylesProvider links={[{ rel: "stylesheet", href: "/fonts/avenir.css" }]}>
  <App />
</StylesProvider>
```

The `fontFamily` `base` and `heading` tokens (nice-styles) name Google Sans Flex first and fall back to `system-ui`, then `sans-serif`, when it is not loaded. To use another family, load it here and override `fontFamily` with `setTokens`.

`StylesProvider` imports `nice-styles/tokens.css`; it does not load `nice-styles/reset.css` (import that yourself, after `tokens.css` — see the nice-styles README).

## Breakpoint keys

A bare name is one band (`tablet`); `+` covers that breakpoint and wider (`tablet+`); `-` covers it and narrower (`tablet-`). The same keys work in `setTokens` values, `withBreakpoints` overrides, and `getBreakpoint`.

Allowed prop values of nice-react-* components (resolved unions): `~/nice/manifest/agents/catalog.json`.

## License

MIT
