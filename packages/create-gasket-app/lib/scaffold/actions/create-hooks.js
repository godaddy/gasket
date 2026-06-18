import { withGasketSpinner } from '../with-spinner.js';
import { ConfigBuilder } from '../config-builder.js';
import { Files } from '../files.js';
import Readme from '../readme.js';

/** @type {import('../../internal.d.ts').createHooks} */
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

export default withGasketSpinner('Execute create hooks', createHooks);
