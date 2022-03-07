const path = require('path');
// const Gitignore = require('./gitignore');

/**
 * Create hook adds template files if gitInit
 *
 * @param {Gasket} gasket - Gasket
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
module.exports = async function create(gasket, context) {
  const { gitInit, files, gitignore = {} } = context;

  if (gitInit) {
    files.add(
      path.join(__dirname, '..', 'generator', '.*')
    );

    await gasket.exec('addGitignore', gitignore);
  }
};
