import action from '../action-wrapper.js';
import { runShellCommand } from '@gasket/utils';

/**
 * Executes the `postCreate` hook for all registered plugins.
 *
 * @param {GasketEngine} gasket - Gasket API
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function postCreateHooks({ gasket, context }) {
  const { dest } = context;

  /**
   * Run an npm script in the context of the created application
   * @param  {String} script name of script
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
