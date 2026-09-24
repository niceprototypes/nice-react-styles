[2026-07-27 13:42] major: Re-export SizeType (was CellHeightType) for the size token rename
[2026-09-14 18:30] major: Stop re-exporting setCoreTokens, setThemeTokens, setBreakpointTokens (removed from nice-styles)
[2026-09-14 21:00] major: Re-export transformColor / TransformColorOptions (renamed from getHSLA / GetHSLAOptions in nice-styles)
[2026-09-14 22:30] major: Single token getter — remove re-exports of getTokenKey, getTokenValue, getThemeToken*, getBreakpointToken*, getComponentToken*, getTokenFromMap, getTokenByPath, TokenResult, TokenFromMapOptions; add getConstantKey, applyTheme, TokenOptions, TokenAccessor, ThemeName
[2026-09-15 00:20] major: setTokens drops the colorSchemeEnabled option — runtime themed tokens always follow prefers-color-scheme and [data-theme] pins
[2026-09-15 01:15] major: Stop re-exporting setBreakpoints (removed from nice-styles) — use setTokens({ breakpoints })
[2026-09-15 01:25] minor: setTokens types the breakpoints key (Partial<BreakpointValues>) and documents it
[2026-09-15 09:30] minor: Re-export BREAKPOINT_ORDER, SETTABLE_BREAKPOINTS, SettableBreakpoint; useBreakpoint derives from SETTABLE_BREAKPOINTS
[2026-09-15 09:45] major: Re-exported transformColor takes theme in the options object (nice-styles signature change)
[2026-09-15 18:26] minor: Re-export listTokens, registry, registerTokens and TokenListing, ListTokensFilter, TokenSource, TokenEntry, TokenValue from nice-styles
[2026-09-15 18:35] patch: README rewritten for the current API (StylesProvider, Theme, setTokens, withBreakpoints, hooks, nice-styles re-exports)
[2026-09-16 15:11] major: Re-exported TokenOptions no longer has prefix — component tokens are addressed as "button.icon.size:small"
[2026-09-16 16:21] minor: Re-export resolveColorProp, ColorTokenProp, ColorPropObject, ChannelValue
[2026-09-24 18:07] minor: Add useLocale hook and StylesProvider locale / dir props exposing locale and text direction to JavaScript
