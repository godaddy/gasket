/// <reference types="@gasket/core" />

const { name, version, devDependencies } = require('../package.json');

/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
module.exports = async function create(gasket, context) {
  const generatorDir = `${__dirname}/../generator`;

  context.gasketConfig.addPlugin('pluginExpress', name);

  context.pkg.add('dependencies', {
    [name]: `^${version}`,
    express: devDependencies.express
  });

  if (context.apiApp) {
    const glob = context.typescript ? '**/*.ts' : '**/*.js';
    context.files.add(`${generatorDir}/${glob}`);
  }
};
