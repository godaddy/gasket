/// <reference types="@gasket/core" />

const { name, version, devDependencies } = require('../package.json');

/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
module.exports = async function create(gasket, context) {
  const generatorDir = `${__dirname}/../generator`;

  context.gasketConfig.addPlugin('pluginFastify', name);

  context.pkg.add('dependencies', {
    [name]: `^${version}`,
    fastify: devDependencies.fastify
  });

  if ('apiApp' in context && context.apiApp) {
    context.gasketConfig.add('fastify', {
      routes: []
    });

    if ('typescript' in context && context.typescript) {
      context.files.add(`${generatorDir}/**/!(*.js)`);
      context.gasketConfig
        .addImport('{ routes }', './routes/index.ts');
    } else {
      context.files.add(`${generatorDir}/**/!(*.ts)`);
      context.gasketConfig
        .addImport('{ routes }', './routes/index.js');
    }

    context.gasketConfig
      .addImport('{ routes }', './routes/index.js')
      .injectValue('fastify.routes', 'routes');
  }
};
