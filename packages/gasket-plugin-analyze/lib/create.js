/// <reference types="@gasket/cli" />

/** @type {import('@gasket/engine').HookHandler<'create'>} */
module.exports = function create(gasket, context) {
  const { pkg } = context;

  pkg.add('scripts', {
    analyze: 'gasket analyze'
  });
};
