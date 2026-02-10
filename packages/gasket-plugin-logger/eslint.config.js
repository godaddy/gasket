import rootConfig from '../../eslint.config.js';
import { defineConfig, globalIgnores } from 'eslint/config';

export default defineConfig([
  ...rootConfig,
  globalIgnores(['lib/**', 'cjs/**'])
]);
