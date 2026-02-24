/* eslint-disable no-undefined */
import path from 'path';
import chalk from 'chalk';
import semver from 'semver';
import { readJson, writeJson } from '../utils/fs.js';

export const name = 'sync-deps';
export const description = 'Align shared dependency versions across templates';
export const emoji = '🔄';
export const mode = 'cross-template';
export const skipResults = true;

function getAllDeps(pkg) {
  return {
    ...(pkg.dependencies || {}),
    ...(pkg.devDependencies || {}),
    ...(pkg.peerDependencies || {})
  };
}

/**
 * Coerce a version spec (^1.2.3, ~4.5.0, 1.2.3, next) to a comparable semver or null.
 */
function coerceSpec(spec) {
  if (!spec || typeof spec !== 'string') return null;
  if (spec.startsWith('workspace:')) return null;
  const coerced = semver.coerce(spec.replace(/^[\^~]/, ''));
  return coerced ? coerced.version : null;
}

/**
 * Pick the highest version from a list of specs; return a ^ range.
 */
function pickHighestSpec(specs) {
  const versions = specs.map(s => coerceSpec(s)).filter(Boolean);
  if (versions.length === 0) return null;
  const max = versions.sort(semver.rcompare)[0];
  return `^${max}`;
}

export async function handler(templates, ctx) {
  const { results, flags } = ctx;
  if (templates.length === 0) {
    console.log(chalk.gray('No templates to sync.'));
    return;
  }

  const pkgFilter = flags.pkg ? new RegExp(`^${flags.pkg.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`) : null;

  // 1. Read all template package.json files
  const templatePkgs = [];
  for (const t of templates) {
    const pkgPath = path.join(t.templateDir, 'package.json');
    const pkg = readJson(pkgPath);
    if (!pkg) {
      results.record(t.name, 'skipped', 'no package.json');
      continue;
    }
    templatePkgs.push({ template: t, pkg, pkgPath });
  }

  // 2. Find deps that appear in more than one template; collect versions
  const depToSpecs = /** @type {Record<string, string[]>} */ ({});
  const depToLocations = /** @type {Record<string, Array<{ pkg: object, depType: string }>>} */ ({});

  for (const { pkg } of templatePkgs) {
    const deps = getAllDeps(pkg);
    for (const [name, spec] of Object.entries(deps)) {
      if (pkgFilter && !pkgFilter.test(name)) continue;
      if (spec.startsWith('workspace:')) continue;
      if (!depToSpecs[name]) {
        depToSpecs[name] = [];
        depToLocations[name] = [];
      }
      if (!depToSpecs[name].includes(spec)) depToSpecs[name].push(spec);
      for (const depType of ['dependencies', 'devDependencies', 'peerDependencies']) {
        if (pkg[depType] && pkg[depType][name] !== undefined) {
          depToLocations[name].push({ pkg, depType });
          break;
        }
      }
    }
  }

  const toAlign = Object.entries(depToSpecs).filter(([n, specs]) => {
    const uniq = [...new Set(specs)];
    if (uniq.length <= 1) return false;
    if (pkgFilter && !pkgFilter.test(n)) return false;
    return true;
  });

  if (toAlign.length === 0) {
    console.log(chalk.green('\n✅ No version drift; nothing to sync.\n'));
    templatePkgs.forEach(({ template }) => results.record(template.name, 'passed'));
    return;
  }

  // 3. For each shared dep with drift, pick highest and update all pkgs; record changes for report
  const report = /** @type {Array<{ dep: string, to: string, updates: Array<{ template: string, from: string }> }>} */ ([]);
  let changed = false;
  for (const [depName, specs] of toAlign) {
    const targetSpec = pickHighestSpec(specs);
    if (!targetSpec) continue;
    const locations = depToLocations[depName] || [];
    const updates = [];
    for (const { pkg, depType } of locations) {
      const current = pkg[depType][depName];
      if (current !== targetSpec) {
        pkg[depType][depName] = targetSpec;
        changed = true;
        const templateName = templatePkgs.find(t => t.pkg === pkg)?.template?.name ?? '?';
        updates.push({ template: templateName, from: current });
      }
    }
    if (updates.length > 0) report.push({ dep: depName, to: targetSpec, updates });
  }

  if (!changed) {
    console.log(chalk.green('\n✅ No version drift; nothing to sync.\n'));
    templatePkgs.forEach(({ template }) => results.record(template.name, 'passed'));
    return;
  }

  // 4. Write updated package.json
  for (const { template, pkg, pkgPath } of templatePkgs) {
    writeJson(pkgPath, pkg);
    results.record(template.name, 'passed');
  }

  // 5. Report what changed and tell user to regen lockfiles
  console.log(chalk.bold('\n📋 Aligned dependencies (package.json updated):\n'));
  for (const { dep, to, updates } of report) {
    const lines = updates.map(u => `  ${chalk.cyan(u.template)}: ${u.from} → ${chalk.green(to)}`);
    console.log(chalk.yellow(dep) + ' → ' + chalk.green(to));
    lines.forEach(l => console.log(l));
    console.log('');
  }
  console.log(chalk.gray('Run ') + chalk.white('pnpm template regen') + chalk.gray(' (or npm install in each template) to refresh lockfiles.\n'));
}
