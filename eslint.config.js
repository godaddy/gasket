import { defineConfig, globalIgnores } from 'eslint/config';
import jest from 'eslint-plugin-jest';
import goddaddyTypescript from 'eslint-config-godaddy-typescript';
import goddaddyReactTypescript from 'eslint-config-godaddy-react-typescript';
import unicorn from 'eslint-plugin-unicorn';
import vitest from '@vitest/eslint-plugin';
import jsdoc from 'eslint-plugin-jsdoc';
import typescriptParser from '@typescript-eslint/parser';
import typescriptPlugin from '@typescript-eslint/eslint-plugin';

export default defineConfig([
  ...goddaddyTypescript,
  ...goddaddyReactTypescript,
  vitest.configs.recommended,
  jsdoc.configs['flat/recommended'],
  globalIgnores([
    '**/node_modules/**',
    '**/dist/**',
    '**/cjs/**',
    '**/react/**',
    '**/generator/**',
    '**/__mocks__/**',
    '**/test/fixtures/**',
    '**/gasket-redux/lib',
    '**/template/dist',
    '**/template/.next',
    '**/template/.docs'
  ]),
  //
  // Configurations for Jest and Unicorn
  //
  {
    plugins: {
      jest,
      unicorn
    },
    linterOptions: {
      reportUnusedDisableDirectives: 'error'
    },
    languageOptions: {
      globals: {
        ...jest.environments.globals.globals,
        vi: 'readonly',
        expect: 'readonly',
        describe: 'readonly',
        it: 'readonly',
        test: 'readonly',
        beforeEach: 'readonly',
        afterEach: 'readonly',
        beforeAll: 'readonly',
        afterAll: 'readonly'
      }
    },
    rules: {
      ...jest.configs.recommended.rules,
      'unicorn/filename-case': 'error',
      'no-sync': 'warn',
      'vitest/expect-expect': 'warn'
    }
  },
  //
  // Configurations for TypeScript files
  //
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      typescriptPlugin.configs['flat/recommended']
    ],
    plugins: {
      '@typescript-eslint': typescriptPlugin
    },
    languageOptions: {
      parser: typescriptParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        ecmaFeatures: {
          jsx: true
        }
      }
    },
    rules: {
      'no-unused-vars': 'off',
      'no-unused-expressions': 'off',
      'no-unused-labels': 'off',
      'no-undef': 'warn',
      'camelcase': 'off',
      'spaced-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-unused-vars': 'warn',
      '@typescript-eslint/no-empty-object-type': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param': 'off'
    }
  },
  //
  // Disable certain rules for TypeScript test files
  //
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    rules: {
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  //
  // Disable JSDoc rules for test files
  //
  {
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param': 'off'
    }
  },

  {
    files: ['**/*.d.ts'],
    rules: {
      '@typescript-eslint/triple-slash-reference': 'off'
    }
  }
]);
