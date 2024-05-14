/// <reference types="create-gasket-app" />

/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/core').HookHandler<'create'>}
 */
module.exports = function create(gasket, context) {
  const { pkg } = context;

  pkg.add('scripts', {
    analyze: 'gasket analyze'
  });
};
