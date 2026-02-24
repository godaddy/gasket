import chalk from 'chalk';

export const name = 'peer-deps';
export const description = 'Report peer dependency issues (npm ls)';
export const emoji = '🔗';
export const mode = 'cross-template';
export const skipResults = true;

function parseNpmLs(stdout) {
  try {
    return JSON.parse(stdout);
  } catch {
    return { problems: [], dependencies: {} };
  }
}

/** Build map of pkg@version -> reason (from tree nodes with .invalid). */
function buildInvalidReasons(tree) {
  const reasons = {};
  function walk(deps) {
    if (!deps || typeof deps !== 'object') return;
    for (const [name, node] of Object.entries(deps)) {
      if (node && typeof node === 'object' && node.invalid) {
        const spec = node.version ? `${name}@${node.version}` : name;
        if (!reasons[spec]) reasons[spec] = node.invalid;
      }
      if (node && node.dependencies) walk(node.dependencies);
    }
  }
  walk(tree.dependencies);
  return reasons;
}

/** Format a problem string; show package causing the issue and, for invalid, the reason from the tree. */
function formatProblem(p, invalidReasons = {}) {
  if (typeof p !== 'string') return p;
  const missingMatch = p.match(/^missing: ([^,]+),\s*required by (\S+)$/);
  if (missingMatch) {
    const [, dep, requirer] = missingMatch;
    return `${chalk.cyan(requirer)} requires: ${dep} ${chalk.gray('(missing)')}`;
  }
  const invalidMatch = p.match(/^invalid: (.+?)(?:\s+\/|$)/);
  if (invalidMatch) {
    const spec = invalidMatch[1].trim();
    const reason = invalidReasons[spec];
    const suffix = reason ? chalk.gray(` — expected: ${reason}`) : chalk.gray(' (invalid)');
    return `${chalk.cyan(spec)}${suffix}`;
  }
  const extraneousMatch = p.match(/^extraneous: (.+?)(?:\s+\/|$)/);
  if (extraneousMatch) return `${chalk.cyan(extraneousMatch[1].trim())} ${chalk.gray('(extraneous)')}`;
  return p;
}

export async function handler(templates, ctx) {
  const { runner, results } = ctx;
  const noLegacyEnv = { ...process.env, npm_config_legacy_peer_deps: 'false' };

  console.log(chalk.bold('\nPeer Dependency Analysis:\n'));

  for (const t of templates) {
    const { stdout } = await runner.runCommandCaptureStdout(
      'npm',
      ['ls', '--all', '--json'],
      t.templateDir,
      { customEnv: noLegacyEnv }
    );
    const data = parseNpmLs(stdout);
    const problems = data.problems || [];
    const invalidReasons = buildInvalidReasons(data);

    if (problems.length === 0) {
      console.log(chalk.green(`  ${t.name}: No peer dependency issues`));
      results.record(t.name, 'passed');
      continue;
    }

    console.log(chalk.yellow(`  ${t.name}:`));
    for (const p of problems.slice(0, 15)) {
      console.log(chalk.red(`    ❌ `) + formatProblem(p, invalidReasons));
    }
    if (problems.length > 15) {
      console.log(chalk.gray(`    ... and ${problems.length - 15} more`));
    }
    results.record(t.name, 'failed', `${problems.length} peer dep problem(s)`);
  }

  console.log(chalk.gray('\nFix manually or use npm install --legacy-peer-deps in templates as needed.\n'));
}
