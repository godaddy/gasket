import { withSpinner } from '../with-spinner.js';
import { runShellCommand } from '@gasket/utils';

/**
 * Initialize git repository, create main branch, and make initial commit
 * @type {import('../../internal.d.js').gitInit}
 */
async function gitInit({ context }) {
  try {
    await runShellCommand('git', ['init'], { cwd: context.dest });
    await runShellCommand('git', ['checkout', '-b', 'main'], { cwd: context.dest });
    await runShellCommand('git', ['add', '.'], { cwd: context.dest });
    await runShellCommand('git', ['commit', '-m', '🎉 Created new repository with create-gasket-app'], { cwd: context.dest });
  } catch (error) {
    if (error.stderr.includes('fatal: a branch named \'main\' already exists')) {
      context.warnings.push('A branch named \'main\' already exists');
    } else {
      context.warnings.push('Failed to initialize git repository');
    }
  }
}

export default withSpinner('Initialize git repo', gitInit);
