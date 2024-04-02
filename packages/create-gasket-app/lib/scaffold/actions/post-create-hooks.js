const action = require('../action-wrapper');
const createEngine = require('../create-engine');
const { runShellCommand } = require('@gasket/utils');

/**
 * Executes the `postCreate` hook for all registered plugins.
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function postCreateHooks(context) {
  const { dest, presets = [], plugins = [] } = context;

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

  const gasket = await createEngine({ dest, presets, plugins });
  await gasket.exec('postCreate', context, utils);
}

module.exports = action('Execute postCreate hooks', postCreateHooks);
