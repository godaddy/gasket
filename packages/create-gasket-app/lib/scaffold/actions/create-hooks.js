import action from '../action-wrapper.js';
import { ConfigBuilder } from '../config-builder.js';
import { Files } from '../files.js';
import Readme from '../readme.js';

/**
 * Executes the `create` hook for all registered plugins.
 * Adds `files` to context for plugins to add their files and templates.
 *
 * @type {import('../../internal').createHooks}
 */
async function createHooks({ gasket, context }) {
  const { warnings } = context;
  const files = new Files();
  const readme = new Readme();
  const gasketConfig = ConfigBuilder.create({}, { orderBy: ['plugins'], warnings });
  Object.assign(context, { files, readme, gasketConfig });

  await gasket.execApply('create', async function applyCreate(plugin, handler) {
    await handler(context.runWith(plugin));
  });
}

export default action('Execute create hooks', createHooks);
