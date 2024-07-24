const { devDependencies } = require('../package.json');

/** @type {import('@gasket/core').HookHandler<'create'>} */
module.exports = function create(gasket, { pkg, files }) {
  const generatorDir = `${__dirname}/../generator`;

  pkg.add('dependencies', {
    'elastic-apm-node': devDependencies['elastic-apm-node']
  });
  pkg.add('scripts', {
    start: 'gasket start --require ./setup.js'
  });

  files.add(`${generatorDir}/*`);
};
