import { createEngine } from '../create-engine.js';
import action from '../action-wrapper.js';
import { ConfigBuilder } from '../config-builder.js';
import { Files } from '../files.js';

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

export default action('Execute create hooks', createHooks);
