import fs from 'fs';
import path from 'path';

export const name = 'update-deps';
export const description = 'Update dependencies to latest (default: scoped packages only)';
export const emoji = '⬆️';
export const mode = 'per-template';
/** ncu hits registry per template — run one at a time to avoid rate limits. */
export const concurrency = 1;

/**
 * Updates dependencies in each template's package.json using npm-check-updates.
 * Run regen (or npm install in each template) to refresh lockfiles.
 * Default: only packages matching config.updateDepsFilter. Use --filter or --pkg to override.
 */
export async function handler(template, ctx) {
  const { runner, config, flags } = ctx;
  const { templateDir, name: packageName } = template;

  const packageJsonPath = path.join(templateDir, 'package.json');
  if (!fs.existsSync(packageJsonPath)) {
    console.log('⚠️  No package.json found, skipping');
    return;
  }

  let filterPattern = config.updateDepsFilter ?? '/^@gasket\\/.*$|^@godaddy\\/.*$/';
  if (flags.filter) {
    filterPattern = flags.filter;
  } else if (flags.pkg) {
    filterPattern = `^${flags.pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`;
  }
  const packageFile = `packages/${packageName}/template/package.json`;

  const args = [
    'npm-check-updates',
    '-u',
    '--packageFile', packageFile,
    '--filter', filterPattern
  ];

  try {
    await runner.runCommand(
      'npx',
      args,
      config.root,
      { npm_config_loglevel: 'error' }
    );
  } catch (err) {
    console.log(`❌ npm-check-updates failed: ${err.message}`);
    throw err;
  }
}

export const postRunMessage = 'Run pnpm template regen (or npm install in each template) to refresh lockfiles.';
