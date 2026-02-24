import path from 'path';
import chalk from 'chalk';
import { readJson, writeJson } from '../utils/fs.js';

export const name = 'remove-dep';
export const description = 'Remove a dependency across templates';
export const emoji = '➖';
export const mode = 'cross-template';
export const skipResults = true;

export async function handler(templates, ctx) {
  const { results, flags } = ctx;
  const pkgName = flags.positional?.[0];
  if (!pkgName) {
    console.error(chalk.red('Usage: remove-dep <pkg>'));
    throw new Error('Missing package name');
  }

  const updated = [];
  for (const t of templates) {
    const pkgPath = path.join(t.templateDir, 'package.json');
    const pkg = readJson(pkgPath);
    if (!pkg) {
      results.record(t.name, 'skipped', 'no package.json');
      continue;
    }
    let removed = false;
    for (const key of ['dependencies', 'devDependencies', 'peerDependencies']) {
      if (pkg[key] && pkg[key][pkgName]) {
        delete pkg[key][pkgName];
        removed = true;
      }
    }
    if (removed) {
      writeJson(pkgPath, pkg);
      updated.push(t.name);
    }
    results.record(t.name, 'passed');
  }

  if (updated.length > 0) {
    console.log(chalk.bold('\n📋 Removed dependency (package.json updated):\n'));
    console.log(chalk.yellow(pkgName));
    updated.forEach((n) => console.log(chalk.cyan('  ' + n)));
    console.log('');
    console.log(chalk.gray('Run ') + chalk.white('pnpm template regen') + chalk.gray(' (or npm install in each template) to refresh lockfiles.\n'));
  }
}
