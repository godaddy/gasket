/**
 * Add scripts for commands to the package.json
 *
 * @param {Gasket} gasket - The gasket API.
 * @param {CreateContext} context - Create context
 */
module.exports = function create(gasket, context) {
  const { pkg } = context;

  pkg.add('scripts', {
    build: 'gasket build',
    start: 'gasket start',
    local: 'gasket local'
  });
};
