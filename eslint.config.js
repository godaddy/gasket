import { defineConfig, globalIgnores } from 'eslint/config';
import jest from 'eslint-plugin-jest';
import goddaddyTypescript from 'eslint-config-godaddy-typescript';
import goddaddyReactTypescript from 'eslint-config-godaddy-react-typescript';
import unicorn from 'eslint-plugin-unicorn';
import vitest from '@vitest/eslint-plugin';
import jsdoc from 'eslint-plugin-jsdoc';

export default defineConfig([
  ...goddaddyTypescript,
  ...goddaddyReactTypescript,
  vitest.configs.recommended,
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/cjs/**',
    '**/react/**',
    '**/generator/**',
    '**/__mocks__/**',
    '**/test/fixtures/**',
    '**/gasket-redux/lib'
  ]),
  {
    plugins: {
      jest,
      unicorn,
      jsdoc
    },
    languageOptions: {
      globals: {
        ...jest.environments.globals.globals,
      },
    },
    rules: {
      ...jest.configs.recommended.rules,
      'unicorn/filename-case': 'error',
      'no-sync': 'warn'
    }
  }
]);
