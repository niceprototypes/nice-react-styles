import { createConfiguration } from 'nice-configuration/rollup'

export default createConfiguration({
  additionalExternals: ['nice-styles', 'nice-styles/tokens.css'],
  dtsInput: 'dist/esm/types/index.d.ts',
})