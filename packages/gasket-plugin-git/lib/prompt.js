/**
 * Prompt for git settings during gasket create
 *
 * @param {Gasket} gasket - Gasket
 * @param {CreateContext} context - Create context
 * @param {Object} utils - Prompt utils
 * @param {Function} utils.prompt - Inquirer prompt
 * @returns {Promise<object>} context
 */
module.exports = async function promptHook(gasket, context, { prompt }) {

  if (!('gitInit' in context)) {
    const { gitInit } = await prompt([
      {
        name: 'gitInit',
        message: 'Do you want a git repo to be initialized?',
        type: 'confirm'
      }]);

    return { ...context, gitInit };
  }

  return context;
};
