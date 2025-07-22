import { defineConfig } from "eslint/config";
import jest from 'eslint-plugin-jest';
import godaddy from 'eslint-config-godaddy';
import goddaddyTypescript from 'eslint-config-godaddy-typescript';
import goddaddyReact from 'eslint-config-godaddy-react';
import goddaddyReactTypescript from 'eslint-config-godaddy-react-typescript';
import unicorn from 'eslint-plugin-unicorn';
import vitest from '@vitest/eslint-plugin';
import jsdoc from 'eslint-plugin-jsdoc';

export default defineConfig([
  ...godaddy,
  ...goddaddyTypescript,
  ...goddaddyReact,
  ...goddaddyReactTypescript,
  {
    ignores: [
      '**/node_modules/**',
      '**/dist/**',
      '**/cjs/**',
      '**/react/**',
      '**/generator/**',
      '**/__mocks__/**',
      '**/test/fixtures/**',
      '**/gasket-redux/lib'
    ]
  },
  {
    plugins: {
      jest,
      vitest,
      unicorn,
      jsdoc
    },
    languageOptions: {
      globals: {
        ...vitest.environments.env.globals,
        ...jest.environments.globals.globals,
      },
    },
    rules: {
      ...vitest.configs.recommended.rules,
      'unicorn/filename-case': 'error',
      'no-sync': 'off',

      /* Gets false positives */
      'react-hooks/rules-of-hooks': 'off',
    }
  }
]);
