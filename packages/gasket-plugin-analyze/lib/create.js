/**
 * Add files & extend package.json for new apps.
 *
 * @param {Gasket} gasket - The gasket API.
 * @param {CreateContext} context - Create context
 */
module.exports = function create(gasket, context) {
  const { pkg } = context;

  pkg.add('scripts', {
    analyze: 'gasket analyze'
  });
};
