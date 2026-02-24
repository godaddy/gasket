import path from 'path';
import chalk from 'chalk';
import { readJson, writeJson } from '../utils/fs.js';

export const name = 'add-dep';
export const description = 'Add a dependency across templates';
export const emoji = '➕';
export const mode = 'cross-template';
export const skipResults = true;

export async function handler(templates, ctx) {
  const { runner, config, results, flags } = ctx;
  const spec = flags.positional?.[0];
  if (!spec) {
    console.error(chalk.red('Usage: add-dep <pkg>[@version] [--dev]'));
    throw new Error('Missing package spec');
  }
  const target = flags.dev ? 'devDependencies' : 'dependencies';
  const at = spec.indexOf('@');
  const name_ = at > 0 ? spec.slice(0, at) : spec;
  const versionFromSpec = at > 0 ? spec.slice(at + 1) : null;

  let versionSpec;
  if (versionFromSpec && versionFromSpec !== '*' && versionFromSpec !== 'latest') {
    const versionAlreadyRange = /^[\^~]/.test(versionFromSpec);
    versionSpec = versionAlreadyRange ? versionFromSpec : `^${versionFromSpec}`;
  } else {
    const viewArgs = config.registry
      ? ['view', name_, 'version', '--json', '--registry', config.registry]
      : ['view', name_, 'version', '--json'];
    const { stdout, code } = await runner.runCommandCaptureStdout(
      'npm',
      viewArgs,
      config.root || process.cwd(),
      { log: () => {} }
    );
    if (code !== 0 || !stdout.trim()) {
      throw new Error(`Could not resolve latest version for ${name_}. Is it published?`);
    }
    let parsed;
    try {
      parsed = JSON.parse(stdout.trim());
    } catch {
      throw new Error(`Could not resolve latest version for ${name_}. Is it published?`);
    }
    if (parsed && typeof parsed === 'object' && parsed.error) {
      throw new Error(`Could not resolve latest version for ${name_}: ${parsed.error.summary || parsed.error.detail || 'not found'}`);
    }
    const v = typeof parsed === 'string' ? parsed : parsed?.version ?? parsed;
    if (!v || typeof v !== 'string') {
      throw new Error(`Could not resolve latest version for ${name_}.`);
    }
    versionSpec = `^${v}`;
  }

  const updated = [];
  for (const t of templates) {
    const pkgPath = path.join(t.templateDir, 'package.json');
    const pkg = readJson(pkgPath);
    if (!pkg) {
      results.record(t.name, 'skipped', 'no package.json');
      continue;
    }
    if (!pkg[target]) pkg[target] = {};
    pkg[target][name_] = versionSpec;
    writeJson(pkgPath, pkg);
    updated.push(t.name);
    results.record(t.name, 'passed');
  }

  if (updated.length > 0) {
    console.log(chalk.bold('\n📋 Added dependency (package.json updated):\n'));
    console.log(chalk.yellow(name_) + ' @ ' + chalk.green(versionSpec) + chalk.gray(` (${target})`));
    updated.forEach((n) => console.log(chalk.cyan('  ' + n)));
    console.log('');
    console.log(chalk.gray('Run ') + chalk.white('pnpm template regen') + chalk.gray(' (or npm install in each template) to refresh lockfiles.\n'));
  }
}
