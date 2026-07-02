// Ambient declaration for side-effect CSS imports (e.g. `import "nice-styles/tokens.css"`).
// CSS modules carry no types; this lets the build resolve the import without TS2882.
declare module "*.css"
