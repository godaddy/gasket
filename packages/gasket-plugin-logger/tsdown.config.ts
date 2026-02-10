import { createDualConfig } from '../../configs/tsdown.config.mts';
import { defineConfig } from 'tsdown';

export default defineConfig(
  createDualConfig(['src/index.ts', 'src/utils.ts'])
);

