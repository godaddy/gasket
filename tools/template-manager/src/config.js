/**
 * Template Manager Configuration
 * OS repo-specific settings for the template manager tool.
 */

import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default {
  // ─────────────────────────────────────────────────────────────────────────────
  // Core Settings
  // ─────────────────────────────────────────────────────────────────────────────

  /** Monorepo root directory. */
  root: path.resolve(__dirname, '../../../'),

  /** Directory containing template packages. */
  packagesDir: path.resolve(__dirname, '../../../packages'),

  /** Prefix filter for template package names. */
  templateFilter: 'gasket-template-',

  /** npm registry URL. */
  registry: 'https://registry.npmjs.org/',

  // ─────────────────────────────────────────────────────────────────────────────
  // Operation Settings
  // ─────────────────────────────────────────────────────────────────────────────

  /** Regex filter for update-deps (ncu --filter). Only matching deps are updated. */
  updateDepsFilter: '/^@gasket\\/.*$/',

  /** Retry npm ci/install with --legacy-peer-deps on peer dep failures. */
  retryWithLegacyPeerDeps: true,

  /** Args passed to npm ci. */
  npmCiArgs: ['ci', '--prefer-offline'],

  /** Directories to remove during clean operation. */
  cleanDirs: ['dist', 'build', '.next', 'coverage', '.nyc_output', 'node_modules'],

  /** Environment variables for lint operation. */
  lintEnv: { ESLINT_USE_FLAT_CONFIG: 'false' },

  /** Environment variables for test operation. */
  testEnv: { ESLINT_USE_FLAT_CONFIG: 'false' },

  // ─────────────────────────────────────────────────────────────────────────────
  // Validation Settings
  // ─────────────────────────────────────────────────────────────────────────────

  /**
   * validate-dotfiles settings.
   * @property {string[]} expectedDotFiles - Dotfiles that should exist
   * @property {string[]} allowedUnpackedDotFiles - Dotfiles that don't need to be in npm pack
   */
  validateDotfiles: {
    expectedDotFiles: ['.npmrc.template', '.gitignore.template'],
    allowedUnpackedDotFiles: ['.gitignore']
  },

  /**
   * validate-structure settings.
   * Entries can be string (exact match) or RegExp (top-level only).
   * @property {string[]} expectedScripts - Scripts all templates must have
   * @property {(string|RegExp)[]} expectedFiles - Files all templates must have
   * @property {Object} expectedFilesByTemplate - Per-template file requirements
   * @property {Object} expectedScriptsByTemplate - Per-template script requirements
   * @property {string[]} forbiddenFiles - Files that must not exist
   */
  validateStructure: {
    expectedScripts: [
      'build',
      'test',
      'test:watch',
      'test:coverage',
      'start',
      'local',
      'lint',
      'lint:fix',
      'docs',
      'posttest'
    ],
    expectedFiles: [
      'package-lock.json',
      'package.json',
      /gasket\.js|gasket\.ts/,
      'test',
      'vitest.config.js',
      '.gitignore',
      '.npmrc.template',
      '.gitignore.template'
    ],
    expectedFilesByTemplate: {
      'gasket-template-nextjs-app': [
        'next.config.js',
        'app',
        'locales',
        'test'
      ],
      'gasket-template-nextjs-pages': [
        'next.config.js',
        'pages',
        'locales',
        'test'
      ],
      'gasket-template-nextjs-express': [
        'next.config.js',
        'pages',
        'locales',
        'test'
      ],
      'gasket-template-api-express': [
        'server.ts',
        'plugins',
        'swagger.json'
      ],
      'gasket-template-api-fastify': [
        'server.ts',
        'plugins',
        'swagger.json'
      ]
    },
    expectedScriptsByTemplate: {
      'gasket-template-nextjs-app': [
        'preview',
        'start:https',
        'local:https',
        'build:tsc:watch',
        'build:tsc'
      ],
      'gasket-template-nextjs-pages': [
        'preview',
        'start:https',
        'local:https',
        'build:tsc:watch',
        'build:tsc'
      ],
      'gasket-template-nextjs-express': [
        'preview',
        'build:tsc:watch',
        'build:tsc'
      ],
      'gasket-template-api-express': [
        'preview'
      ],
      'gasket-template-api-fastify': [
        'preview'
      ]
    },
    forbiddenFiles: []
  }
};
