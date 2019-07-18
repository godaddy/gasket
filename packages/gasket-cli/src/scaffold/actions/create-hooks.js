const path = require('path');
const PluginEngine = require('@gasket/plugin-engine');
const action = require('../action-wrapper');
const ConfigBuilder = require('../config-builder');
const Files = require('../files');

/**
 * Executes the `create` hook for all registered plugins.
 * Adds `files` to context for plugins to add their files and templates.
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function createHooks(context) {
  const { dest, presets = [], plugins = [] } = context;

  const files = new Files();
  const gasketConfig = ConfigBuilder.create({}, { orderBy: ['plugins'] });
  Object.assign(context, { files, gasketConfig });

  const resolveFrom = path.join(dest, 'node_modules');
  const engineConfig = {
    plugins: {
      presets,
      add: plugins
    }
  };

  const gasket = new PluginEngine(engineConfig, { resolveFrom });
  await gasket.execApply('create', async function applyCreate(plugin, handler) {
    await handler(context.runWith(plugin));
  });
}

module.exports = action('Execute create hooks', createHooks);
