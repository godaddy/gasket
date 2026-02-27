/**
 * CLI argument parsing and usage display.
 */

import os from 'os';
import chalk from 'chalk';

/** All available operations. */
const OPERATION_LIST = [
  'npm-ci',
  'build',
  'test',
  'lint',
  'clean',
  'regen',
  'update-deps',
  'validate-dotfiles',
  'status',
  'sync-deps',
  'peer-deps',
  'audit',
  'add-dep',
  'remove-dep',
  'validate-structure',
  'exec'
];

/**
 * Parse command line arguments.
 * @param {string[]} argv - process.argv
 * @returns {{ operation: string|null, flags: object }}
 * @example
 *   parseArgv(['node', 'index.js', 'build', '--only=webapp-app', '--bail'])
 *   // => { operation: 'build', flags: { only: ['webapp-app'], bail: true, ... } }
 */
export function parseArgv(argv) {
  const args = argv.slice(2);
  const flags = {
    bail: false,
    concurrency: os.cpus().length,
    fix: false,
    yes: false,
    dev: false
  };

  for (const arg of args) {
    if (arg.startsWith('--only=')) {
      flags.only = arg.slice(7).split(',').map(s => s.trim()).filter(Boolean);
    } else if (arg.startsWith('--filter=')) {
      flags.filter = arg.slice(9).trim();
    } else if (arg.startsWith('--pkg=')) {
      flags.pkg = arg.slice(6).trim();
    } else if (arg === '--bail') {
      flags.bail = true;
    } else if (arg === '--no-concurrency') {
      flags.concurrency = 1;
    } else if (arg.startsWith('--concurrency=')) {
      const n = parseInt(arg.slice(14), 10);
      if (Number.isFinite(n) && n >= 1) flags.concurrency = n;
    } else if (arg === '--fix') {
      flags.fix = true;
    } else if (arg === '--yes') {
      flags.yes = true;
    } else if (arg === '--dev') {
      flags.dev = true;
    }
  }

  const positionals = args.filter(a => !a.startsWith('--'));
  const operation = positionals[0] ?? null;
  flags.positional = positionals.slice(1);

  return { operation, flags };
}

/**
 * Display usage information.
 */
export function showUsage() {
  console.log(`${chalk.bold('Usage:')} pnpm template ${chalk.cyan('<operation>')} ${chalk.gray('[flags]')}`);
  console.log('');
  console.log(chalk.bold.underline('Operations:'));
  for (const op of OPERATION_LIST) {
    console.log(`  ${chalk.cyan(op)}`);
  }
  console.log('');
  console.log(chalk.bold.underline('Flags:'));
  console.log(`  ${chalk.yellow('--only')}=${chalk.gray('<names>')}       Filter templates (comma-separated substring match)`);
  console.log(`  ${chalk.yellow('--bail')}               Stop on first failure`);
  console.log(`  ${chalk.yellow('--concurrency')}=${chalk.gray('<n>')}    Parallel execution (default: CPU count)`);
  console.log(`  ${chalk.yellow('--no-concurrency')}     Sequential execution`);
  console.log(`  ${chalk.yellow('--pkg')}=${chalk.gray('<name>')}         Target single package (update-deps, sync-deps)`);
  console.log(`  ${chalk.yellow('--filter')}=${chalk.gray('<regex>')}     Custom dep filter (update-deps)`);
  console.log(`  ${chalk.yellow('--dev')}                Add to devDependencies (add-dep)`);
  console.log('');
  console.log(chalk.bold.underline('Examples:'));
  console.log(`  ${chalk.dim('$')} pnpm template ${chalk.cyan('build')}`);
  console.log(`  ${chalk.dim('$')} pnpm template ${chalk.cyan('test')} ${chalk.yellow('--only')}=webapp-app ${chalk.yellow('--bail')}`);
  console.log(`  ${chalk.dim('$')} pnpm template ${chalk.cyan('update-deps')} ${chalk.yellow('--pkg')}=eslint`);
  console.log(`  ${chalk.dim('$')} pnpm template ${chalk.cyan('add-dep')} lodash@4 ${chalk.yellow('--dev')}`);
  console.log(`  ${chalk.dim('$')} pnpm template ${chalk.cyan('exec')} "npm outdated"`);
}
