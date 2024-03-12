/// <reference types="@gasket/cli" />

/**
 * Add files & extend package.json for new apps.
 * @type {import('@gasket/engine').HookHandler<'create'>}
 */
module.exports = function create(gasket, context) {
  const { pkg } = context;

  pkg.add('scripts', {
    analyze: 'gasket analyze'
  });
};
