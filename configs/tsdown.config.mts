import { type UserConfig } from 'tsdown';

export const shared: UserConfig = {
  format: ['esm', 'cjs'],
  sourcemap: true,
  clean: true,
  treeshake: true,
  dts: true,
  outDir: 'lib'
};

/**
 * Creates a dual ESM/CJS build configuration
 * @param {string[]} entry - Array of entry points (e.g., ['src/index.ts', 'src/utils.ts'])
 */
export const createDualConfig = (entry: string[]): UserConfig[] => [
  // ESM build - outputs to lib/
  {
    ...shared,
    format: ['esm'],
    entry,
    outDir: 'lib',
    dts: true
  },
  // CJS build - outputs to cjs/
  {
    ...shared,
    format: ['cjs'],
    entry,
    outDir: 'cjs',
    dts: false
  }
];
