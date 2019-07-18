const action = require('../action-wrapper');
const Git = require('../git');


/**
 * Initialize the app with a git repo and creates a first commit with generated files
 *
 * @param {CreateContext} context - Create context
 * @returns {Promise} promise
 */
async function doGitInit(context) {
  const { gitInit, dest } = context;

  if (gitInit) {
    const git = new Git(dest);
    await git.init();
    await git.add();
    await git.commit(':tada: Created new repository with gasket create');
  }
}

module.exports = action('Initialize git repository', doGitInit);
