import action from '../action-wrapper.js';
import { runShellCommand } from '@gasket/utils';

/**
 * Executes the `postCreate` hook for all registered plugins.
 * @type {import('../../internal').postCreateHooks}
 */
async function postCreateHooks({ gasket, context }) {
  const { dest } = context;

  /**
   * Run an npm script in the context of the created application
   * @param  {string} script name of script
   * @returns {Promise} A promise represents if npm succeeds or fails.
   */
  async function runScript(script) {
    return await runShellCommand('npm', ['run', script], { cwd: dest });
  }

  /**
   * An object with one value for now, so adding more utilities
   * in future is easy.
   */
  const utils = { runScript };
  await gasket.exec('postCreate', context, utils);
}

export default action('Execute postCreate hooks', postCreateHooks);
