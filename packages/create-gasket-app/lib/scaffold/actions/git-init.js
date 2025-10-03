import { withSpinner } from '../with-spinner.js';
import { runShellCommand } from '@gasket/utils';

/**
 * Initialize git repository, create main branch, and make initial commit
 * @type {import('../../internal.d.js').gitInit}
 */
async function gitInit({ context }) {
  await runShellCommand('git', ['init'], { cwd: context.dest });
  await runShellCommand('git', ['checkout', '-b', 'main'], { cwd: context.dest });
  await runShellCommand('git', ['add', '.'], { cwd: context.dest });
  await runShellCommand('git', ['commit', '-m', '🎉 Created new repository with gasket create'], { cwd: context.dest });
}

export default withSpinner('Initialize git repo', gitInit);
