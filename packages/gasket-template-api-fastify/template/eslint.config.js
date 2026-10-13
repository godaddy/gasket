import { defineConfig, globalIgnores } from 'eslint/config';
import godaddy from 'eslint-config-godaddy';
import typescriptParser from '@typescript-eslint/parser';

export default defineConfig([
  ...godaddy,
  globalIgnores(['dist/', 'coverage/', 'build/']),
  {
    files: ['**/*.{ts,tsx}'],
    languageOptions: {
      parser: typescriptParser
    }
  }
]);
