[2026-07-27 13:42] major: Re-export SizeType (was CellHeightType) for the size token rename
[2026-09-14 18:30] major: Stop re-exporting setCoreTokens, setThemeTokens, setBreakpointTokens (removed from nice-styles)
[2026-09-14 21:00] major: Re-export transformColor / TransformColorOptions (renamed from getHSLA / GetHSLAOptions in nice-styles)
[2026-09-14 22:30] major: Single token getter — remove re-exports of getTokenKey, getTokenValue, getThemeToken*, getBreakpointToken*, getComponentToken*, getTokenFromMap, getTokenByPath, TokenResult, TokenFromMapOptions; add getConstantKey, applyTheme, TokenOptions, TokenAccessor, ThemeName
[2026-09-15 00:20] major: setTokens drops the colorSchemeEnabled option — runtime themed tokens always follow prefers-color-scheme and [data-theme] pins
[2026-09-15 01:15] major: Stop re-exporting setBreakpoints (removed from nice-styles) — use setTokens({ breakpoints })
[2026-09-15 01:25] minor: setTokens types the breakpoints key (Partial<BreakpointValues>) and documents it
