/// <reference types="create-gasket-app" />

const { name, version, devDependencies } = require('../package.json');

/**
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
async function create(gasket, {
  pkg,
  files,
  gasketConfig,
  typescript
}) {
  pkg.add('dependencies', {
    [name]: `^${version}`,
    '@gasket/data': devDependencies['@gasket/data']
  });

  const generatorDir = `${__dirname}/../generator`;
  const glob = typescript ? '*.ts' : '*.js';
  files.add(
    `${generatorDir}/${glob}`
  );

  gasketConfig
    .addPlugin('pluginData', name);

  gasketConfig
    .addImport('gasketData', `./gasket-data.js`)
    .injectValue('data', 'gasketData');
}

module.exports = create;
