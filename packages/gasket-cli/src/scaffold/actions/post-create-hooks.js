const path = require('path');
const action = require('../action-wrapper');
const PluginEngine = require('@gasket/plugin-engine');
const run = require('../../run-shell-command');

/**
 * Executes the `postCreate` hook for all registered plugins.
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function postCreateHooks(context) {
  const { dest, presets = [], plugins = [] } = context;
  const resolveFrom = path.join(dest, 'node_modules');

  const engineConfig = {
    plugins: {
      presets,
      add: plugins
    }
  };

  /**
   * Run an npm script in the context of the created application
   * @param  {String} script name of script
   * @returns {Promise} A promise represents if npm succeeds or fails.
   */
  async function runScript(script) {
    return await run('npm', ['run', script], { cwd: dest });
  }

  /**
   * An object with one value for now, so adding more utilities
   * in future is easy.
   */
  const utils = { runScript };

  const gasket = new PluginEngine(engineConfig, { resolveFrom });
  await gasket.exec('postCreate', context, utils);
}

module.exports = action('Execute postCreate hooks', postCreateHooks);
