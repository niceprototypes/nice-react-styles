import { createConfiguration } from 'nice-configuration/rollup'

export default createConfiguration({
  additionalExternals: ['nice-styles', 'nice-styles/variables.css'],
  dtsInput: 'dist/esm/types/index.d.ts',
})