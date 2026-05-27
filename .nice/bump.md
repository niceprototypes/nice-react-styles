[2026-05-26 04:00] major: Rename `Mode` component → `Theme` to align with `data-theme`; rename `mode` parameter conventions to `theme`; consume the renamed `Colors` (was `Theme`) value from nice-styles.

Component renames:
- Folder `src/components/Mode/` → `src/components/Theme/`
- File `Mode.tsx` → `Theme.tsx`
- `Mode` component → `Theme` component (output unchanged: still renders `<div data-theme={name} style={{display:contents}}>`)
- Interface `ModeProps` → `ThemeProps` (its `name: ModeType` field becomes `name: ThemeType`)

Re-exports (mirroring nice-styles' rename):
- `getModeToken*` → `getThemeToken*`
- `setModeTokens` → `setThemeTokens`
- `DEFAULT_MODE` → `DEFAULT_THEME`
- `ModeType` → `ThemeType`
- `ModeValue` → `ThemeValue`
- Removed `getInvertedMode` re-export
- Removed `Mode` component export → replaced with `Theme`

StylesProvider:
- Imports the renamed `Colors` value (was `Theme`) from nice-styles and passes it as `<ThemeProvider theme={Colors}>` to styled-components. No behavior change.

createTokens service:
- Type imports `ModeValue` → `ThemeValue`; internal alias `TokenMapWithModes` → `TokenMapWithThemes`.

No deprecation alias period — workspace-internal refactor; consumers update in the same change cycle.