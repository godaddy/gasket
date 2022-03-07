const Gitignore = require('./gitignore');

function serialize(content) {
  let desiredContent = '';

  for (const category in content) {
    if (content[category].length) {
      category !== '' ? desiredContent += `# ${category}\n` : null;
      desiredContent += content[category].join('\n');
      desiredContent += '\n\n';
    }
  }

  return desiredContent;
}

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

    const gitignore = new Gitignore();
    Object.defineProperties(gitignore, {
      content: {
        get() {
          return serialize(this.content);
        }
      }
    });
    context.gitignore = gitignore;

    return { ...context, gitInit };
  }

  return context;
};
