/// <reference types="@gasket/cli" />

const { devDependencies } = require('../package.json');

/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/engine').HookHandler<'create'>}
 */
module.exports = async function create(gasket, context) {
  const generatorDir = `${ __dirname }/../generator`;

  context.pkg.add('dependencies', {
    express: devDependencies.express
  });

  if (context.apiApp) {
    context.files.add(`${ generatorDir }/**/*`);

    context.gasketConfig.add('express', {
      routes: './routes/*'
    });
  }
};
