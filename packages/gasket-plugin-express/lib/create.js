/// <reference types="@gasket/cli" />

const { name, version, devDependencies } = require('../package.json');

/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/engine').HookHandler<'create'>}
 */
module.exports = async function create(gasket, context) {
  const generatorDir = `${__dirname}/../generator`;

  context.gasketConfig.addPlugin('pluginExpress', name);


  context.pkg.add('dependencies', {
    [name]: version,
    express: devDependencies.express
  });

  if ('apiApp' in context && context.apiApp) {
    context.gasketConfig.add('express', {
      routes: []
    });
  }

  if ('typescript' in context && context.typescript) {
    context.files.add(`${generatorDir}/**/!(*.js)`);
    context.gasketConfig
      .addImport('routes', './routes')
      .useImport('express.routes', 'routes');
  } else {
    // @ts-expect-error
    context.gasketConfig.add('howdy', {
      yippee: {
        doo: {
          dah: {
            yay: 'hey'
          }
        }
      }
    });
    context.gasketConfig
      .addImport('{ howdy, hey, yo }', '@howdy/yippee/doo/dah/yay')
      .addExpression('const dude = yo();')
      .addExpression(`function aloha() { return 'aloha'; }`)
      .injectValue('howdy.yippee.doo.dah.yay', '[ howdy, dude, hey, aloha() ]');

    context.files.add(`${generatorDir}/**/!(*.ts)`);
    context.gasketConfig
      .addImport('routes', './routes/index.js')
      .injectValue('express.routes', 'routes');
  }
};
