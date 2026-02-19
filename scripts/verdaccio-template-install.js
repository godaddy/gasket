#!/usr/bin/env node
/**
 * Updates all @gasket/* dependencies in template/package.json files to the
 * specified local tag, then runs npm install against the local Verdaccio registry.
 *
 * Usage:
 *   node scripts/verdaccio-template-install.js [tag] [template-filter]
 *
 * Examples:
 *   node scripts/verdaccio-template-install.js
 *   node scripts/verdaccio-template-install.js local
 *   node scripts/verdaccio-template-install.js local fastify
 */

import { execSync } from 'child_process';
import { readFileSync, writeFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';
import { globSync } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');
const REGISTRY = 'http://localhost:4873';
const tag = process.argv[2] || 'local';
const filter = process.argv[3] || '';

function checkVerdaccio() {
  try {
    execSync(`curl -sf ${REGISTRY}/-/ping`, { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
}

function updateGasketDeps(pkgJson, tag) {
  let changed = false;
  for (const section of ['dependencies', 'devDependencies']) {
    if (!pkgJson[section]) continue;
    for (const [name, version] of Object.entries(pkgJson[section])) {
      if (name.startsWith('@gasket/') && version !== tag) {
        pkgJson[section][name] = tag;
        changed = true;
      }
    }
  }
  return changed;
}

if (!checkVerdaccio()) {
  console.error(`ERROR: Verdaccio is not running at ${REGISTRY}`);
  console.error('Run "pnpm verdaccio:start" first, then "pnpm verdaccio:publish"');
  process.exit(1);
}

const pattern = filter
  ? `packages/gasket-template-*${filter}*/template/package.json`
  : 'packages/gasket-template-*/template/package.json';

const templatePkgs = globSync(pattern, { cwd: ROOT });

if (!templatePkgs.length) {
  console.error(`No templates found matching: ${pattern}`);
  process.exit(1);
}

console.log(`\nUpdating @gasket/* deps to tag "${tag}" and installing from ${REGISTRY}\n`);

for (const relPath of templatePkgs) {
  const pkgPath = resolve(ROOT, relPath);
  const templateDir = dirname(pkgPath);
  const templateName = relPath.split('/')[1];

  const pkgJson = JSON.parse(readFileSync(pkgPath, 'utf8'));
  const changed = updateGasketDeps(pkgJson, tag);

  if (changed) {
    writeFileSync(pkgPath, JSON.stringify(pkgJson, null, 2) + '\n');
    console.log(`Updated ${templateName}/template/package.json`);
  }

  console.log(`Installing in ${templateName}/template...`);
  try {
    execSync(`npm install --registry ${REGISTRY}`, {
      cwd: templateDir,
      stdio: 'inherit',
      env: {
        ...process.env,
        [`npm_config_//localhost:4873/:_authToken`]: 'local-dev-token'
      }
    });
    console.log(`Done: ${templateName}\n`);
  } catch (err) {
    console.error(`FAILED: ${templateName}`);
    console.error(err.message);
    process.exit(1);
  }
}

console.log('============================================');
console.log(`All templates installed with @gasket@${tag}`);
console.log(`Registry: ${REGISTRY}`);
console.log('');
console.log('To restore template package.json files:');
console.log("  git checkout -- 'packages/gasket-template-*/template/package.json'");
console.log('============================================');
