const createEngine = require('../create-engine');
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
  const { dest, presets = [], plugins = [], warnings } = context;

  const files = new Files();
  const gasketConfig = ConfigBuilder.create({}, { orderBy: ['plugins'], warnings });
  Object.assign(context, { files, gasketConfig });

  const gasket = await createEngine({ dest, presets, plugins });
  await gasket.execApply('create', async function applyCreate(plugin, handler) {
    await handler(context.runWith(plugin));
  });
}

module.exports = action('Execute create hooks', createHooks);
