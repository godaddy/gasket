import { withGasketSpinner } from '../with-spinner.js';
import { runShellCommand } from '@gasket/utils';

/**
 * Executes the `postCreate` hook for all registered plugins.
 * @type {import('../../internal.js').postCreateHooks}
 */
async function postCreateHooks({ gasket, context }) {
  const { dest, packageManager } = context;

  /**
   * Determines the correct command for running scripts based on the package manager.
   * @param {string} script - The name of the script to run.
   * @returns {Promise} A promise that resolves if the script runs successfully.
   */
  async function runScript(script) {
    let cmd;

    switch (packageManager) {
      case 'yarn':
        cmd = 'yarn';
        break;
      case 'pnpm':
        cmd = 'pnpm';
        break;
      case 'npm':
      default:
        cmd = 'npm';
        break;
    }

    return await runShellCommand(cmd, ['run', script], { cwd: dest });
  }

  /**
   * An object with one value for now, so adding more utilities in future is easy.
   */
  const utils = { runScript };
  await gasket.exec('postCreate', context, utils);
}

export default withGasketSpinner('Execute postCreate hooks', postCreateHooks);
