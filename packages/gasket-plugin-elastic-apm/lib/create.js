const { name, version, devDependencies } = require('../package.json');

/** @type {import('@gasket/core').HookHandler<'create'>} */
module.exports = function create(gasket, { pkg, files, gasketConfig }) {
  const generatorDir = `${__dirname}/../generator`;

  gasketConfig.addPlugin('pluginElasticApm', name);

  pkg.add('dependencies', {
    [name]: `^${version}`,
    'dotenv': devDependencies['dotenv'],
    'elastic-apm-node': devDependencies['elastic-apm-node']
  });

  pkg.add('scripts', {
    start: 'gasket start --require ./setup.js'
  });

  files.add(`${generatorDir}/*`);
};
