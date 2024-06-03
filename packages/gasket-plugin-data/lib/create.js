/// <reference types="create-gasket-app" />

const { name, version, devDependencies } = require('../package.json');

/**
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
async function create(gasket, { pkg, files, gasketConfig }) {
  pkg.add('dependencies', {
    [name]: `^${version}`,
    '@gasket/data': devDependencies['@gasket/data']
  });

  const generatorDir = `${ __dirname }/../generator`;
  files.add(
    `${generatorDir}/*`
  );

  gasketConfig
    .addPlugin('pluginData', name);

  gasketConfig
    .addImport('gasketData', './gasket.data.js')
    .injectValue('data', 'gasketData');
}

module.exports = create;
