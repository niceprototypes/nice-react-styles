[2026-06-08 00:59] major: Rename createTokens to setTokens
[2026-06-08 23:23] major: Remove StylesProvider loadFonts prop; pass an explicit googleFonts URL instead
[2026-06-09 19:09] patch: StylesProvider builds font links via nice-styles' shared buildGoogleFontsConfig / buildAdobeFontsConfig; link-building deduped out of the provider, behavior unchanged
[2026-06-10 23:59] minor: withBreakpoints precedence is now specificity-first via nice-styles shared logic — at a viewport, all matching keys sort least-to-most specific and merge so the most specific wins (was: ranges by insertion order then exact last). Same object API; tie-break behavior refined. BreakpointKey type now re-exported from nice-styles
[2026-06-15 22:38] minor: Re-export getHSLA (and GetHSLAOptions) from nice-styles so React consumers can import the HSLA-token adjuster from nice-react-styles
