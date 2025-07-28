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
    '**/gasket-redux/lib'
  ]),
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
      // ...jsdoc.configs['flat/recommended'].rules,
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
  {
    files: ['**/*.test.{ts,tsx}', '**/*.spec.{ts,tsx}'],
    extends: [typescriptPlugin.configs['flat/recommended']],
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
      '@typescript-eslint/no-unsafe-assignment': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off',
      '@typescript-eslint/no-unsafe-call': 'off',
      '@typescript-eslint/no-unsafe-return': 'off',
      '@typescript-eslint/ban-ts-comment': 'off',
      '@typescript-eslint/no-explicit-any': 'warn',
      '@typescript-eslint/no-unsafe-function-type': 'warn',
      '@typescript-eslint/no-unused-vars': 'off',
      '@typescript-eslint/no-empty-object-type': 'off',
      '@typescript-eslint/triple-slash-reference': 'warn',
      '@typescript-eslint/no-wrapper-object-types': 'off',

      'jsdoc/require-returns': 'off',
      'jsdoc/require-param': 'off',

      'camelcase': 'off',
      'spaced-comment': 'off'
    }
  },
  {
    files: ['**/*.test.{js,jsx}', '**/*.spec.{js,jsx}'],
    rules: {
      'jsdoc/require-jsdoc': 'off',
      'jsdoc/require-returns': 'off',
      'jsdoc/require-param': 'off'
    }
  },
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
        ...jest.environments.globals.globals
      }
    },
    rules: {
      ...jest.configs.recommended.rules,
      'unicorn/filename-case': 'error',
      'no-sync': 'warn',
      'vitest/expect-expect': 'warn'
    }
  }
]);
