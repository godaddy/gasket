/// <reference types="@gasket/cli" />

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

  if ('apiApp' in context && context.apiApp) {
    context.gasketConfig.add('express', {
      routes: []
    });

    if ('typescript' in context && context.typescript) {
      context.files.add(`${generatorDir}/**/!(*.js)`);
    } else {
      context.files.add(`${generatorDir}/**/!(*.ts)`);
    }

    context.gasketConfig
      .addImport('{ routes }', './routes/index.js')
      .injectValue('express.routes', 'routes');
  }
};
