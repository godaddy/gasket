import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { readJson } from '../utils/fs.js';

export const name = 'status';
export const description = 'Show template health and dependency drift';
export const emoji = '📊';
export const mode = 'cross-template';
export const skipResults = true;

function getDepVersions(templates) {
  const byDep = /** @type {Record<string, Record<string, string>>} */ ({});
  for (const t of templates) {
    const pkgPath = path.join(t.templateDir, 'package.json');
    const pkg = readJson(pkgPath);
    if (!pkg) continue;
    const deps = { ...pkg.dependencies, ...pkg.devDependencies };
    for (const [name, version] of Object.entries(deps)) {
      if (!byDep[name]) byDep[name] = {};
      byDep[name][t.name] = version;
    }
  }
  return byDep;
}

export async function handler(templates, ctx) {
  const { config, results } = ctx;

  console.log(chalk.bold('\nTemplate Status:\n'));

  for (const t of templates) {
    const pkgPath = path.join(t.templateDir, 'package.json');
    const nodeModulesPath = path.join(t.templateDir, 'node_modules');
    const lockPath = path.join(t.templateDir, 'package-lock.json');

    const hasPkg = fs.existsSync(pkgPath);
    const hasNodeModules = fs.existsSync(nodeModulesPath);
    const hasLock = fs.existsSync(lockPath);

    let status = '';
    if (!hasPkg) {
      status = chalk.red('no package.json');
      results.record(t.name, 'failed', 'no package.json');
    } else if (!hasNodeModules) {
      status = chalk.red('no node_modules');
      results.record(t.name, 'failed', 'no node_modules');
    } else {
      let stale = false;
      try {
        const nmStat = fs.statSync(nodeModulesPath);
        if (hasLock) {
          const lockStat = fs.statSync(lockPath);
          if (lockStat.mtime > nmStat.mtime) stale = true;
        }
        const pkgStat = fs.statSync(pkgPath);
        if (pkgStat.mtime > nmStat.mtime) stale = true;
      } catch {
        // ignore
      }
      if (stale) {
        status = chalk.yellow('deps stale (package.json or lockfile newer than node_modules)');
        results.record(t.name, 'passed');
      } else {
        status = chalk.green('deps fresh, lockfile present');
        results.record(t.name, 'passed');
      }
    }
    console.log(`  ${t.name}: ${status}`);
  }

  const byDep = getDepVersions(templates, config);
  const shared = Object.entries(byDep).filter(([, versions]) => Object.keys(versions).length > 1);
  if (shared.length === 0) return;

  const aligned = shared.filter(([, versions]) => new Set(Object.values(versions)).size === 1);
  const drift = shared.filter(([, versions]) => new Set(Object.values(versions)).size > 1);

  console.log(chalk.bold('\nDependency Alignment:\n'));

  if (aligned.length > 0) {
    const n = aligned.length;
    const templateCount = Object.keys(aligned[0][1]).length;
    console.log(chalk.green(`  ✅ ${n} shared dep${n === 1 ? '' : 's'} aligned across ${templateCount} templates`));
    if (aligned.length <= 15) {
      aligned.forEach(([depName, versions]) => {
        const ver = Object.values(versions)[0];
        console.log(chalk.gray(`     ${depName}: ${ver}`));
      });
    } else {
      aligned.slice(0, 8).forEach(([depName, versions]) => {
        const ver = Object.values(versions)[0];
        console.log(chalk.gray(`     ${depName}: ${ver}`));
      });
      console.log(chalk.gray(`     ... and ${aligned.length - 8} more`));
    }
    console.log('');
  }

  if (drift.length > 0) {
    console.log(chalk.yellow(`  ⚠️  ${drift.length} dep${drift.length === 1 ? '' : 's'} with version drift:\n`));
    for (const [depName, versions] of drift) {
      console.log(chalk.yellow(`     ${depName}:`));
      for (const [tpl, ver] of Object.entries(versions)) {
        console.log(chalk.gray(`       ${tpl}: ${ver}`));
      }
      console.log('');
    }
  }
  console.log('');
}
