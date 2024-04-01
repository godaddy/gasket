/// <reference types="@gasket/cli" />

/**
 * Add scripts for commands to the package.json
 * @type {import('@gasket/engine').HookHandler<'create'>}
 */
module.exports = function create(gasket, context) {
  const { pkg } = context;

  pkg.add('scripts', {
    build: 'gasket build',
    start: 'gasket start',
    local: 'gasket local'
  });
};
