import path from 'path';
import fs from 'fs';
import chalk from 'chalk';
import { readJson } from '../utils/fs.js';

export const name = 'validate-structure';
export const description = 'Check templates conform to expected structure';
export const emoji = '📐';
export const mode = 'cross-template';

export async function handler(templates, ctx) {
  const { config, results } = ctx;
  const {
    expectedScripts = [],
    expectedFiles = [],
    expectedScriptsByTemplate = {},
    expectedFilesByTemplate = {},
    forbiddenFiles = []
  } = config.validateStructure || {};

  for (const t of templates) {
    const pkgPath = path.join(t.templateDir, 'package.json');
    const pkg = readJson(pkgPath);
    const errors = [];

    if (!pkg) {
      results.record(t.name, 'failed', 'no package.json');
      continue;
    }

    const scripts = pkg.scripts || {};
    const requiredScripts = expectedScriptsByTemplate[t.name]
      ? expectedScripts.concat(expectedScriptsByTemplate[t.name])
      : expectedScripts;
    for (const script of requiredScripts) {
      if (!scripts[script]) errors.push(`missing script: ${script}`);
    }

    const requiredFiles = expectedFilesByTemplate[t.name]
      ? expectedFiles.concat(expectedFilesByTemplate[t.name])
      : expectedFiles;
    let topLevelNames = null;
    for (const file of requiredFiles) {
      if (typeof file === 'string') {
        if (!fs.existsSync(path.join(t.templateDir, file))) {
          errors.push(`missing file: ${file}`);
        }
      } else if (file instanceof RegExp) {
        // Regex matches top-level names only (no recursion). Use string paths like 'app/page.tsx' for subdirs.
        if (!topLevelNames) {
          try {
            topLevelNames = fs.readdirSync(t.templateDir, { withFileTypes: true }).map((e) => e.name);
          } catch {
            topLevelNames = [];
          }
        }
        if (!topLevelNames.some((name) => file.test(name))) {
          errors.push(`missing file matching: ${file}`);
        }
      }
    }

    try {
      const entries = fs.readdirSync(t.templateDir, { withFileTypes: true });
      for (const e of entries) {
        if (!e.isFile()) continue;
        const forbidden = forbiddenFiles.some((f) =>
          typeof f === 'string' ? f === e.name : f instanceof RegExp && f.test(e.name)
        );
        if (forbidden) errors.push(`forbidden file: ${e.name}`);
      }
    } catch {
      // ignore
    }

    if (errors.length > 0) {
      console.log(chalk.red(`  ${t.name}:`));
      errors.forEach(e => console.log(chalk.red(`    - ${e}`)));
      results.record(t.name, 'failed', errors.join('; '));
    } else {
      results.record(t.name, 'passed');
    }
  }
  console.log('');
}
