import fs from 'fs';
import path from 'path';

/**
 * Resolve the environment to run a template's lint/test with.
 *
 * Templates that ship their own `eslint.config.js` (flat config) get no forced
 * environment. Templates still on eslintrc get `legacyEnv` (which sets
 * `ESLINT_USE_FLAT_CONFIG=false`): inside the monorepo, ESLint would otherwise
 * discover the root `eslint.config.js` and switch to flat mode, rejecting the
 * template's `--ext` flags.
 * @param {string} templateDir - Template directory
 * @param {object} [legacyEnv] - Env for templates without a flat config
 * @returns {object} Environment variables
 */
export function eslintEnvFor(templateDir, legacyEnv) {
  if (fs.existsSync(path.join(templateDir, 'eslint.config.js'))) return {};
  return legacyEnv ?? {};
}
